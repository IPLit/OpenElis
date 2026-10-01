package us.mn.state.health.lims.login.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


/**
 * Contains http utility methods
 */
public class HttpUtils {
	
	private static Logger log = LogManager.getLogger(HttpUtils.class);
	
	/**
	 * Fetches JSON web keys from the Identity provider at the specified URL
	 * 
	 * @param url the URL of the identity provider
	 * @return JSON web keys
	 * @throws Exception
	 */
	public static String getJsonWebKeys(String url) throws Exception {
		HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
		
		try {
			connection.setRequestProperty("Accept", "application/json");
			connection.setDoInput(true);
			connection.setUseCaches(false);
			connection.setConnectTimeout(0);
			connection.setReadTimeout(0);
			
			if (log.isDebugEnabled()) {
				log.debug("Fetching JSON web keys from identity provider");
			}
			
			connection.connect();
			
			if (connection.getResponseCode() != 200) {
				final String error = connection.getResponseCode() + " " + connection.getResponseMessage();
				throw new Exception("Unexpected response " + error + " from identity provider");
			}
			
			return IOUtils.toString(connection.getInputStream(), StandardCharsets.UTF_8);
		}
		finally {
			if (connection != null) {
				connection.disconnect();
			}
		}
	}
	
	private void setHeadersToConnection(HttpURLConnection conn, Map<String, String> headers) {
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			conn.setRequestProperty(entry.getKey(), entry.getValue());
		}
	}
	
	private int sendDataToUrlConn(HttpURLConnection conn, String request) {
		conn.setDoOutput(true);
		try {
		  // Only for POST.
		  if (StringUtils.isNotBlank(request)) {
			  try(OutputStream os = conn.getOutputStream()) {
				  os.write(request.getBytes("UTF-8"));
			  }
		  }
		  return conn.getResponseCode();
		} catch (IOException x) {
		  throw new RuntimeException(x);
		}
	}
	
	private String performPostRequest(String urlString, Map<String, String> headers, String requestBody) {
	    HttpURLConnection conn = null;

		try {
			URL url = new URL(urlString);
			conn = (HttpURLConnection) url.openConnection();
		    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
		    conn.setRequestProperty("Accept", "*/*");
		    //conn.setRequestProperty("User-Agent", "Mozilla/5.0");
		    conn.setRequestMethod("POST");
		    conn.setConnectTimeout(0);
		    conn.setReadTimeout(0);

		    if (headers != null && headers.size() > 0) {
		      setHeadersToConnection(conn, headers);
		    }
		    int responseCode = sendDataToUrlConn(conn, requestBody);
		    StringBuilder response = new StringBuilder();
		    try(BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
		        String responseLine = null;
		        while ((responseLine = br.readLine()) != null) {
		          response.append(responseLine.trim());
		        }
		     } catch (Exception x) {
		        throw new RuntimeException(x);
		     }
		     return response.toString();
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			if (conn!=null) {
				conn.disconnect();
			}
		}
	}
	
	private String buildEncodedPayload(Map<String, String> payload) {
		try {
			StringBuilder encodedData = new StringBuilder();
			int index = 0;
			for (Map.Entry<String, String> entry : payload.entrySet()) {
				if (index == 0) {
					encodedData.append(URLEncoder.encode(entry.getKey(), "UTF-8")).append("=")
					        .append(URLEncoder.encode(entry.getValue(), "UTF-8"));
					index++;
				} else {
					encodedData.append("&").append(URLEncoder.encode(entry.getKey(), "UTF-8")).append("=")
					        .append(URLEncoder.encode(entry.getValue(), "UTF-8"));
				}
			}
			return encodedData.toString();
		}
		catch (UnsupportedEncodingException x) {
			throw new RuntimeException(x);
		}
	}
	
	private Map<String, String> buildPostHeader() {
	    Map<String, String> map = new HashMap<>();
	    map.put("Content-Type", "application/x-www-form-urlencoded");
	    return map;
	}
	
	public String execPostRequest(String relUrl, Map<String, String> requestAsMap) {
		String encodedString = buildEncodedPayload(requestAsMap);
		String response = performPostRequest(relUrl, buildPostHeader(), encodedString);
		return response;
	}
	
	public String execGetRequest(String url) throws Exception {
		HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
		
		try {
			connection.setRequestProperty("Accept", "application/json");
			connection.setDoInput(true);
			connection.setConnectTimeout(0);
			connection.setReadTimeout(0);
			connection.connect();
			if (connection.getResponseCode() != 200) {
				final String error = connection.getResponseCode() + " " + connection.getResponseMessage();
				throw new Exception("Unexpected response " + error + " from identity provider");
			}
			
			return IOUtils.toString(connection.getInputStream(), StandardCharsets.UTF_8);
		}
		finally {
			if (connection != null) {
				connection.disconnect();
			}
		}
	}

}
