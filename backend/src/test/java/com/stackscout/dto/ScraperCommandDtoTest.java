package com.stackscout.dto;

import com.stackscout.dto.ScraperCommandDto.CommandType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ScraperCommandDtoTest {

    @Test
    void builder_ShouldCreateCommandWithAllFields() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("pypi-scraper")
                .parameters("{\"timeout\":30}")
                .userId(1L)
                .build();

        assertNotNull(command);
        assertEquals(CommandType.START, command.getCommandType());
        assertEquals("pypi-scraper", command.getScraperName());
        assertEquals("{\"timeout\":30}", command.getParameters());
        assertEquals(1L, command.getUserId());
    }

    @Test
    void commandType_ShouldHaveAllValues() {
        assertEquals(6, CommandType.values().length);
        assertNotNull(CommandType.valueOf("START"));
        assertNotNull(CommandType.valueOf("STOP"));
        assertNotNull(CommandType.valueOf("PAUSE"));
        assertNotNull(CommandType.valueOf("RESUME"));
        assertNotNull(CommandType.valueOf("RESTART"));
        assertNotNull(CommandType.valueOf("UPDATE_CONFIG"));
    }

    @Test
    void settersAndGetters_ShouldWorkCorrectly() {
        ScraperCommandDto command = new ScraperCommandDto();

        command.setCommandType(CommandType.STOP);
        command.setScraperName("dockerhub-scraper");
        command.setUserId(2L);

        assertEquals(CommandType.STOP, command.getCommandType());
        assertEquals("dockerhub-scraper", command.getScraperName());
        assertEquals(2L, command.getUserId());
    }
}
