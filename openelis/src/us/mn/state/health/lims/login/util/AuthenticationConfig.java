/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 * <p>
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package us.mn.state.health.lims.login.util;

import org.apache.commons.lang.StringUtils;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.Set;

/**
 * This class provides access to all authentication configuration settings
 * By default, this will load settings from the OpenMRS runtime properties, but can also be set programmatically
 */
public class AuthenticationConfig {

    private static Properties config = null;

    public AuthenticationConfig() {
    }

    public static Properties getProperties() {
		Properties props = new Properties();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		try(InputStream inputStream = classLoader.getResourceAsStream("oauth2.properties")) {
			props.load( new InputStreamReader(inputStream, StandardCharsets.UTF_8));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return props;
	}

    /**
     * @return the configured properties, loading from runtime properties if necessary
     */
    public static Properties getConfig() {
        if (config == null) {
        	try {
        		config = getProperties();
			} catch (Exception e) {
				e.printStackTrace();
			}
        }
        return config;
    }

    /**
     * @param config sets the configuration with the given Properties
     */
    public static void setConfig(Properties config) {
        AuthenticationConfig.config = config;
    }

    /**
     * @param key the configuration property to retrieve
     * @return the value of the given configuration property
     */
    public static String getProperty(String key) {
        return getConfig().getProperty(key);
    }

    /**
     * @param key the configuration property to retrieve
     * @param defaultValue the value to return if the value for the given configuration property is null
     * @return the value of the given configuration property or the defaultValue if null
     */
    public static String getProperty(String key, String defaultValue) {
        return getConfig().getProperty(key, defaultValue);
    }

    /**
     * @param key the configuration key to update
     * @param value the value to update for the given configuration key
     */
    public static void setProperty(String key, String value) {
        if (value == null) {
            getConfig().remove(key);
        }
        else {
            getConfig().setProperty(key, value);
        }
    }

    /**
     * @return all configuration properties currently configured
     */
    public static Set<String> getKeys() {
        return getConfig().stringPropertyNames();
    }

    /**
     * @param key the configuration property to retrieve
     * @param defaultValue the value to return if the value for the given configuration property is null
     * @return the value of the given key, parsed to a boolean, or the default value if null
     */
    public static boolean getBoolean(String key, boolean defaultValue) {
        return getBooleanProp(getProperty(key), defaultValue);
    }

    public static Boolean getBooleanProp(String val, boolean defaultValue) {
        if (StringUtils.isBlank(val)) {
            return defaultValue;
        }
        return Boolean.parseBoolean(val);
    }

    /**
     * @param key the configuration property to retrieve
     * @return the value of the property, parsed into a List, split by comma, or an empty list if not found
     */
    public static List<String> getStringList(String key) {
        return getStringListProp(getProperty(key), ",");
    }

    public static List<String> getStringListProp(String val, String delimiter) {
        List<String> ret = new ArrayList<>();
        if (StringUtils.isNotBlank(val)) {
            ret.addAll(Arrays.asList(val.split(delimiter)));
        }
        return ret;
    }

}
