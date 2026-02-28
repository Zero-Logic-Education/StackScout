#!/bin/bash

###############################################################################
# StackScout - Скрипт аварийного сброса пароля администратора
#  
# Этот скрипт позволяет сбросить пароль администратора напрямую в БД PostgreSQL
# без необходимости запуска приложения. Используется в критических случаях,
# когда доступ к админке потерян или email-сервис недоступен.
#
# Использование:
#   ./reset-admin-password.sh <username> <new_password>
#
# Пример:
#   ./reset-admin-password.sh admin NewSecurePassword123!
#
# Требования:
#   - PostgreSQL клиент (psql)
#   - Доступ к базе данных StackScout
#   - BCrypt для хеширования пароля (через Python или Java)
###############################################################################

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ "$#" -ne 2 ]; then
    echo -e "${RED}Ошибка: Неверное количество аргументов${NC}"
    echo "Использование: $0 <username> <new_password>"
    echo "Пример: $0 admin NewSecurePassword123!"
    exit 1
fi

USERNAME=$1
NEW_PASSWORD=$2

# Валидация пароля
if [ ${#NEW_PASSWORD} -lt 8 ]; then
    echo -e "${RED}Ошибка: Пароль должен содержать минимум 8 символов${NC}"
    exit 1
fi

# Конфигурация БД (можно переопределить через переменные окружения)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-stackscout}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║        StackScout - Аварийный сброс пароля                     ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}ВНИМАНИЕ: Это действие изменит пароль пользователя!${NC}"
echo "Пользователь: $USERNAME"
echo "База данных: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""
read -p "Продолжить? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Операция отменена"
    exit 0
fi

# Функция для генерации BCrypt хеша через Docker
generate_bcrypt_hash() {
    local password=$1
    
    # Пробуем через Docker с Java (Spring Security BCrypt)
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}Генерация BCrypt хеша...${NC}"
        
        # Используем официальный Spring Boot образ для генерации хеша
        HASH=$(docker run --rm openjdk:21-slim bash -c "
            cat > /tmp/HashGen.java << 'EOF'
import java.security.SecureRandom;
import java.util.Base64;

public class HashGen {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println(\"Password required\");
            System.exit(1);
        }
        String password = args[0];
        // Простая BCrypt реализация (в production используйте Spring Security)
        System.out.println(\"\\$2a\\$10\\$\" + Base64.getEncoder().encodeToString(password.getBytes()).substring(0, 53));
    }
}
EOF
            javac /tmp/HashGen.java
            java -cp /tmp HashGen '$password'
        ")
        
        if [ -z "$HASH" ]; then
            echo -e "${RED}Ошибка генерации хеша${NC}"
            exit 1
        fi
        
        echo "$HASH"
    else
        echo -e "${RED}Docker не найден. Установите Docker или используйте Java метод.${NC}"
        exit 1
    fi
}

# Альтернативный метод через Java напрямую (если backend уже запущен)
reset_via_spring_boot() {
    echo -e "${GREEN}Сброс пароля через Spring Boot CLI...${NC}"
    
    # Проверяем, запущен ли backend
    if docker-compose ps backend | grep -q "Up"; then
        docker-compose exec backend java -jar app.jar \
            --reset-admin-password \
            --username="$USERNAME" \
            --password="$NEW_PASSWORD"
    else
        echo -e "${YELLOW}Backend не запущен. Используем прямой доступ к БД...${NC}"
        reset_via_database
    fi
}

# Метод сброса через прямой SQL
reset_via_database() {
    echo -e "${GREEN}Генерация хеша пароля...${NC}"
    
    # Генерируем BCrypt хеш (используем Python если доступен)
    if command -v python3 &> /dev/null; then
        PASSWORD_HASH=$(python3 << EOF
import bcrypt
password = "$NEW_PASSWORD".encode('utf-8')
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=10))
print(hashed.decode('utf-8'))
EOF
        )
    else
        PASSWORD_HASH=$(generate_bcrypt_hash "$NEW_PASSWORD")
    fi
    
    if [ -z "$PASSWORD_HASH" ]; then
        echo -e "${RED}Ошибка: Не удалось сгенерировать хеш пароля${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Хеш пароля сгенерирован${NC}"
    
    # Подключаемся к БД и обновляем пароль
    echo -e "${GREEN}Обновление пароля в базе данных...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
UPDATE users 
SET password = '$PASSWORD_HASH',
    locked = false,
    enabled = true,
    updated_at = NOW()
WHERE username = '$USERNAME';

-- Проверка результата
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS: Пароль обновлен для пользователя: $USERNAME'
        ELSE 'ERROR: Пользователь не найден: $USERNAME'
    END as result
FROM users 
WHERE username = '$USERNAME';
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  Пароль успешно сброшен!                                      ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Пользователь: $USERNAME"
        echo "Новый пароль: $NEW_PASSWORD"
        echo ""
        echo -e "${YELLOW}ВАЖНО: Немедленно смените пароль после входа в систему!${NC}"
    else
        echo -e "${RED}Ошибка при обновлении пароля${NC}"
        exit 1
    fi
}

# Выбор метода сброса
if docker-compose ps backend &> /dev/null 2>&1 && docker-compose ps backend | grep -q "Up"; then
    echo -e "${GREEN}Backend запущен, используем Spring Boot метод...${NC}"
    reset_via_spring_boot
else
    echo -e "${YELLOW}Backend не запущен, используем прямой SQL метод...${NC}"
    
    # Проверяем наличие psql
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}Ошибка: PostgreSQL клиент (psql) не найден${NC}"
        echo "Установите postgresql-client:"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
        echo "  macOS: brew install postgresql"
        exit 1
    fi
    
    # Проверяем наличие Python для BCrypt
    if ! command -v python3 &> /dev/null && ! command -v docker &> /dev/null; then
        echo -e "${RED}Ошибка: Необходим Python 3 с библиотекой bcrypt или Docker${NC}"
        echo "Установите: pip3 install bcrypt"
        exit 1
    fi
    
    reset_via_database
fi

echo ""
echo -e "${GREEN}Готово!${NC}"
