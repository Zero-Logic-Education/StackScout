// File: RabbitMQConfig.java
package com.stackscout.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Существующие настройки для сканирования
    public static final String SCAN_QUEUE = "scan_queue";
    public static final String SCAN_EXCHANGE = "scan_exchange";
    public static final String SCAN_ROUTING_KEY = "scan_routing_key";

    // Настройки для административных команд скрейперов
    public static final String SCRAPER_COMMAND_QUEUE = "scraper_command_queue";
    public static final String SCRAPER_COMMAND_EXCHANGE = "scraper_command_exchange";
    public static final String SCRAPER_COMMAND_ROUTING_KEY = "scraper.command.#";

    // Настройки для уведомлений о статусе скрейперов
    public static final String SCRAPER_STATUS_QUEUE = "scraper_status_queue";
    public static final String SCRAPER_STATUS_EXCHANGE = "scraper_status_exchange";
    public static final String SCRAPER_STATUS_ROUTING_KEY = "scraper.status.#";

    @Bean
    public Queue scanQueue() {
        return new Queue(SCAN_QUEUE);
    }

    @Bean
    public TopicExchange scanExchange() {
        return new TopicExchange(SCAN_EXCHANGE);
    }

    @Bean
    public Binding scanBinding(Queue scanQueue, TopicExchange scanExchange) {
        return BindingBuilder.bind(scanQueue).to(scanExchange).with(SCAN_ROUTING_KEY);
    }

    // Очередь для команд скрейперам
    @Bean
    public Queue scraperCommandQueue() {
        return QueueBuilder.durable(SCRAPER_COMMAND_QUEUE).build();
    }

    @Bean
    public TopicExchange scraperCommandExchange() {
        return new TopicExchange(SCRAPER_COMMAND_EXCHANGE);
    }

    @Bean
    public Binding scraperCommandBinding(Queue scraperCommandQueue, TopicExchange scraperCommandExchange) {
        return BindingBuilder.bind(scraperCommandQueue).to(scraperCommandExchange).with(SCRAPER_COMMAND_ROUTING_KEY);
    }

    // Очередь для статусов скрейперов
    @Bean
    public Queue scraperStatusQueue() {
        return QueueBuilder.durable(SCRAPER_STATUS_QUEUE).build();
    }

    @Bean
    public TopicExchange scraperStatusExchange() {
        return new TopicExchange(SCRAPER_STATUS_EXCHANGE);
    }

    @Bean
    public Binding scraperStatusBinding(Queue scraperStatusQueue, TopicExchange scraperStatusExchange) {
        return BindingBuilder.bind(scraperStatusQueue).to(scraperStatusExchange).with(SCRAPER_STATUS_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
