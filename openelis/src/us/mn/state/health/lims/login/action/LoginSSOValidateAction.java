/*
* The contents of this file are subject to the Mozilla Public License
* Version 1.1 (the "License"); you may not use this file except in
* compliance with the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/ 
* 
* Software distributed under the License is distributed on an "AS IS"
* basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
* License for the specific language governing rights and limitations under
* the License.
* 
* The Original Code is OpenELIS code.
* 
* Copyright (C) The Minnesota Department of Health.  All Rights Reserved.
*  
* Contributor(s): CIRG, University of Washington, Seattle WA.
*/
package us.mn.state.health.lims.login.action;

import org.apache.commons.lang3.StringUtils;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessages;
import org.jose4j.json.JsonUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.jsonwebtoken.Claims;
import us.mn.state.health.lims.common.action.IActionConstants;
import us.mn.state.health.lims.common.log.LogEvent;
import us.mn.state.health.lims.common.util.SystemConfiguration;
import us.mn.state.health.lims.common.util.validator.ActionError;
import us.mn.state.health.lims.login.dao.LoginDAO;
import us.mn.state.health.lims.login.dao.UserModuleDAO;
import us.mn.state.health.lims.login.daoimpl.LoginDAOImpl;
import us.mn.state.health.lims.login.daoimpl.UserModuleDAOImpl;
import us.mn.state.health.lims.login.util.AuthenticationConfig;
import us.mn.state.health.lims.login.util.HttpUtils;
import us.mn.state.health.lims.login.util.JwtUtils;
import us.mn.state.health.lims.login.valueholder.Login;
import us.mn.state.health.lims.login.valueholder.UserSessionData;
import us.mn.state.health.lims.systemuser.dao.SystemUserDAO;
import us.mn.state.health.lims.systemuser.daoimpl.SystemUserDAOImpl;
import us.mn.state.health.lims.systemuser.valueholder.SystemUser;
import us.mn.state.health.lims.systemusermodule.dao.PermissionAgentModuleDAO;
import us.mn.state.health.lims.systemusermodule.daoimpl.RoleModuleDAOImpl;
import us.mn.state.health.lims.systemusermodule.valueholder.RoleModule;
import us.mn.state.health.lims.userrole.dao.UserRoleDAO;
import us.mn.state.health.lims.userrole.daoimpl.UserRoleDAOImpl;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 *  @author     Hung Nguyen (Hung.Nguyen@health.state.mn.us)
 *  bugzilla 2286, added password expired day reminder after user login
 *                 added force user to change password after number of days
 *                 added lock/lock user account after number of failed attempts
 */
public class LoginSSOValidateAction extends LoginBaseAction {

	private final static Logger log = LoggerFactory.getLogger(LoginSSOValidateAction.class);
			
	protected ActionForward performAction(ActionMapping mapping,
			ActionForm form, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String forward = FWD_SUCCESS;

		if (alreadyLoggedIn(request)) return mapping.findForward(forward);
		else request.getSession().invalidate();

		// server-side validation (validation.xml)
		ActionMessages errors = null;
		AuthenticationConfig.getConfig();

		Map<String, Object> detailsAuth = getAuthenticationDetails(request, response);
		if ( detailsAuth == null ) {
			errors = new ActionMessages();
			ActionError error = new ActionError("login.error.message", null, null);
			errors.add(ActionMessages.GLOBAL_MESSAGE, error);
			saveErrors(request, errors);
			return mapping.findForward(FWD_FAIL);
		}
		LoginDAO loginDAO = new LoginDAOImpl();
		Login userInfo = loginDAO.getUserProfile(detailsAuth.get("preferred_username").toString());
		//if invalid loginName entered
		if ( userInfo == null ) {
			errors = new ActionMessages();
			ActionError error = new ActionError("login.error.message", null, null);
			errors.add(ActionMessages.GLOBAL_MESSAGE, error);
			saveErrors(request, errors);
			return mapping.findForward(FWD_FAIL);					
		} else {
			//if valid loginName entered then continue to check
			if ( userInfo.getAccountDisabled().equalsIgnoreCase(YES) ) {
				errors = new ActionMessages();
				ActionError error = new ActionError("login.error.account.disable", null, null);
				errors.add(ActionMessages.GLOBAL_MESSAGE, error);
				saveErrors(request, errors);
				return mapping.findForward(FWD_FAIL);				
			}	
			if ( userInfo.getAccountLocked().equalsIgnoreCase(YES) ) {
				errors = new ActionMessages();
				//ActionError error = new ActionError("login.error.account.lock", null, null);
				//errors.add(ActionMessages.GLOBAL_MESSAGE, error);
				//saveErrors(request, errors);
				//return mapping.findForward(FWD_FAIL); 				
				if ( request.getSession().getAttribute(ACCOUNT_LOCK_TIME) != null ) {
					lockUnlockUserAccount(errors,request,userInfo);
				} else {
					ActionError error = new ActionError("login.error.account.lock", null, null);
					errors.add(ActionMessages.GLOBAL_MESSAGE, error);
					saveErrors(request, errors);	
				}
				return mapping.findForward(FWD_FAIL); 
			}
			if ( userInfo.getPasswordExpiredDayNo() <= 0 ) {
				errors = new ActionMessages();
				ActionError error = new ActionError("login.error.password.expired", null, null);
				errors.add(ActionMessages.GLOBAL_MESSAGE, error);
				saveErrors(request, errors);
				return mapping.findForward(FWD_FAIL);			
			}	
			if ( (userInfo.getPasswordExpiredDayNo() <= Integer.parseInt(SystemConfiguration.getInstance().getLoginUserPasswordExpiredReminderDay())) 
				&&
				 (userInfo.getPasswordExpiredDayNo() > Integer.parseInt(SystemConfiguration.getInstance().getLoginUserChangePasswordAllowDay())) ) {
				errors = new ActionMessages();
				ActionError error = new ActionError("login.password.expired.reminder", userInfo.getPasswordExpiredDayNo(), null);
				errors.add(ActionMessages.GLOBAL_MESSAGE, error);
				saveErrors(request, errors);					
			} else if ( (userInfo.getPasswordExpiredDayNo() <= Integer.parseInt(SystemConfiguration.getInstance().getLoginUserChangePasswordAllowDay()))
				    && (userInfo.getPasswordExpiredDayNo() > 0) ) {
				errors = new ActionMessages();
				ActionError error = new ActionError("login.password.expired.force.notice", userInfo.getPasswordExpiredDayNo(), userInfo.getPasswordExpiredDayNo(), null);
				errors.add(ActionMessages.GLOBAL_MESSAGE, error);
				saveErrors(request, errors);
				return mapping.findForward(FWD_CHANGE_PASS);
			}			
			if ( userInfo.getSystemUserId() == 0 ) {
				errors = new ActionMessages();
				ActionError error = new ActionError("login.error.system.user.id", userInfo.getLoginName(), null);
				errors.add(ActionMessages.GLOBAL_MESSAGE, error);
				saveErrors(request, errors);
				return mapping.findForward(FWD_FAIL);					
			} else {
				SystemUserDAO systemUserDAO = new SystemUserDAOImpl();
				SystemUser su = new SystemUser();
				su.setId(String.valueOf(userInfo.getSystemUserId()));
				systemUserDAO.getData(su);
			
				//setup the user timeout in seconds
				int timeOut = Integer.parseInt((String)userInfo.getUserTimeOut());
				request.getSession().setMaxInactiveInterval(timeOut*60);
			
				UserSessionData usd = new UserSessionData();
				usd.setSytemUserId(userInfo.getSystemUserId());
				usd.setLoginName(userInfo.getLoginName());
				usd.setElisUserName(su.getNameForDisplay());
				usd.setUserTimeOut(timeOut*60);
				request.getSession().setAttribute(USER_SESSION_DATA, usd);

				boolean showAdminMenu = userInfo.getIsAdmin().equalsIgnoreCase(YES);

				if( SystemConfiguration.getInstance().getPermissionAgent().equals("ROLE")){
					HashSet<String> permittedPages = getPermittedForms(usd.getSystemUserId());
					request.getSession().setAttribute(IActionConstants.PERMITTED_ACTIONS_MAP, permittedPages);
					showAdminMenu |= permittedPages.contains("MasterList");
				}
			}
		
			//cleanup session
			if (request.getSession().getAttribute(LOGIN_FAILED_CNT) != null)
				request.getSession().removeAttribute(LOGIN_FAILED_CNT);
			if (request.getSession().getAttribute(ACCOUNT_LOCK_TIME) != null )
				request.getSession().removeAttribute(ACCOUNT_LOCK_TIME);
			
			if ( userInfo.getIsAdmin().equalsIgnoreCase(YES) )
				LogEvent.logInfo("LoginValidateAction","performAction()","======> USER TYPE: ADMIN");
			else {
				LogEvent.logInfo("LoginValidateAction","performAction()","======> USER TYPE: NON-ADMIN");
				UserModuleDAO userModuleDAO = new UserModuleDAOImpl();
				if ( !userModuleDAO.isUserModuleFound(request) ) {
					errors = new ActionMessages();
					ActionError error = new ActionError("login.error.no.module", null, null);
					errors.add(ActionMessages.GLOBAL_MESSAGE, error);
					saveErrors(request, errors);
					return mapping.findForward(FWD_FAIL);
				}
			}
		}
		return mapping.findForward(forward);
	}
	
	@SuppressWarnings("unchecked")
	private HashSet<String> getPermittedForms(int systemUserId) {
		HashSet<String> permittedPages = new HashSet<String>();
		
		UserRoleDAO userRoleDAO = new UserRoleDAOImpl();
		
		List<String> roleIds = userRoleDAO.getRoleIdsForUser( Integer.toString(systemUserId));
		
		PermissionAgentModuleDAO roleModuleDAO = new RoleModuleDAOImpl();

		for( String roleId : roleIds){
			List<RoleModule> roleModules = roleModuleDAO.getAllPermissionModulesByAgentId(Integer.parseInt(roleId));
			
			for( RoleModule roleModule : roleModules){
				permittedPages.add( roleModule.getSystemModule().getSystemModuleName());
			}
		}
		
		return permittedPages;
	}

	/**
	 * Account is locked/unlock after the user entered wrong password (3 times)
	 * @param errors the ActionMessages
	 * @param request the HttpServletRequest
	 * @param login the user login object
	 */
	private void lockUnlockUserAccount(ActionMessages errors, HttpServletRequest request, Login login) {		
		java.util.Calendar loginTime = java.util.Calendar.getInstance();                       
		
		if ( request.getSession().getAttribute(ACCOUNT_LOCK_TIME) != null ) {
			loginTime = (java.util.Calendar)request.getSession().getAttribute(ACCOUNT_LOCK_TIME);
		} else {
			int lockMinute = Integer.parseInt(SystemConfiguration.getInstance().getLoginUserAccountUnlockMinute());
			loginTime.add(java.util.Calendar.MINUTE, +lockMinute);
			request.getSession().setAttribute(ACCOUNT_LOCK_TIME, loginTime);
		} 
		
		java.util.Calendar now = java.util.Calendar.getInstance();
		int diff = Integer.parseInt(String.valueOf((loginTime.getTimeInMillis()-now.getTimeInMillis())/1000));
		
		if ( diff > 0 ) {
	        int seconds = (int)(diff % 60);
	        int minutes = (int)((diff/60) % 60);
	        int hours = (int)((diff/3600) % 24);
	        String secondsStr = (seconds<10 ? "0" : "")+ seconds;
	        String minutesStr = (minutes<10 ? "0" : "")+ minutes;
	        String hoursStr = (hours<10 ? "0" : "")+ hours;		
			String unlockTime = hoursStr + ":" + minutesStr + ":" + secondsStr;
			ActionError error = new ActionError("login.user.account.lock.message", unlockTime, null);
			errors.add(ActionMessages.GLOBAL_MESSAGE, error);
			saveErrors(request, errors);
		} else {			
			request.getSession().removeAttribute(ACCOUNT_LOCK_TIME);
			LoginDAO loginDAO = new LoginDAOImpl();
			loginDAO.unlockAccount(login);
			login.setAccountLocked(NO);
			ActionError error = new ActionError("login.user.account.unlock.message", null);
			errors.add(ActionMessages.GLOBAL_MESSAGE, error);
			saveErrors(request, errors);	
		}						
	}
	
	protected String getPageTitleKey() {
		return null;
	}

	protected String getPageSubtitleKey() {
		return null;
	}

	private Map<String, Object> getAuthenticationDetails(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
		Map<String, Object> userInfoMap = null;
		try {
			log.info("Authentication started");
			// If any credentials were passed in the request or session attempt to authentication with them
			String userInfoJson= getAuthenticationCredentials(httpRequest);
			if (StringUtils.isNotBlank(userInfoJson)) {
				userInfoMap = JsonUtil.parseJson(userInfoJson);
				/*for (Map.Entry<String,Object> entry : userInfoMap.entrySet()) {
					log.error("Key= " + entry.getKey() + 
		                             ", Value= " + entry.getValue()); 
				}*/
			}
		} catch (Exception e) {
			log.error("Authentication failed: " + httpRequest.getRequestURI(), e);
		}
		return userInfoMap;
	}


	private String getAuthenticationCredentials(HttpServletRequest request) {
		String userInfoJson = "";
		try {
			String code = request.getParameter("code");
			if (StringUtils.isNotBlank(code)) {
				String accessTokenUri = AuthenticationConfig.getProperty("accessTokenUri");
				Map<String, String> payload = new HashMap<String, String>();
				payload.put("client_id", AuthenticationConfig.getProperty("clientId"));
				payload.put("client_secret", AuthenticationConfig.getProperty("clientSecret"));
				payload.put("grant_type", AuthenticationConfig.getProperty("grant-type"));
				payload.put("code", code);
				payload.put("redirect_uri", AuthenticationConfig.getProperty("preEstablishedRedirectUri"));
				HttpUtils hUtils = new HttpUtils();
				log.info("Found Authorization code on request: " + code);
				String token = null;
				try {
					token = hUtils.execPostRequest(accessTokenUri, payload);
				}
				catch (Exception e) {
					log.error("Failed to authenticate user creating oauth token", e);
				}
				if (StringUtils.isNotBlank(token)) {
					log.info("Found Authorization token on request: " + token);
					Map<String, Object> tokenMap = JsonUtil.parseJson(token);
					String accessToken = tokenMap.get("access_token").toString();
					//String refreshToken = tokenMap.get("refresh_token").toString();
					//request.setAttribute("refresh_token", refreshToken);
					if (StringUtils.isNotBlank(accessToken)) {
						String[] parts = accessToken.split("\\.");
						//Ignore if this is not a JWT token
						if (parts.length == 3) {
							try {
								
								Claims claims = JwtUtils.parseAndVerifyToken(accessToken, AuthenticationConfig.getConfig());
								userInfoJson = JsonUtil.toJson(claims);
								log.info("oauth token specified with userInfoJson " + userInfoJson);
								//log.info("Success authenticating user using oauth token");
							}
							catch (Exception e) {
								log.error("Failed to authenticate user using oauth token", e);
							}
						}
					}
				}
			}
		}
		catch (Exception e) {
			log.error("Failed to authenticate user using oauth token", e);
		}
		return userInfoJson;
	}

}
