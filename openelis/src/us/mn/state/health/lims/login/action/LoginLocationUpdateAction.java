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
 */
package us.mn.state.health.lims.login.action;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.validator.GenericValidator;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessages;
import us.mn.state.health.lims.common.action.BaseAction;
import us.mn.state.health.lims.common.action.BaseActionForm;
import us.mn.state.health.lims.common.action.IActionConstants;
import us.mn.state.health.lims.common.exception.LIMSRuntimeException;
import us.mn.state.health.lims.common.log.LogEvent;
import us.mn.state.health.lims.common.provider.validation.PasswordValidationFactory;
import us.mn.state.health.lims.common.util.SystemConfiguration;
import us.mn.state.health.lims.common.util.validator.ActionError;
import us.mn.state.health.lims.login.dao.LoginDAO;
import us.mn.state.health.lims.login.daoimpl.LoginDAOImpl;
import us.mn.state.health.lims.login.valueholder.Login;
import us.mn.state.health.lims.login.valueholder.UserSessionData;
import us.mn.state.health.lims.samplesource.daoimpl.SampleSourceDAOImpl;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Hung Nguyen (Hung.Nguyen@health.state.mn.us)
 */
public class LoginLocationUpdateAction extends BaseAction {

	protected ActionForward performAction(ActionMapping mapping, ActionForm form, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String forward = FWD_SUCCESS;
		BaseActionForm dynaForm = (BaseActionForm) form;

		// server-side validation (validation.xml) //regex does not match
		// instructions and can not be varied by installation
		// delete after merge
		ActionMessages errors = new ActionMessages();
		// dynaForm.validate(mapping, request);

		/*
		 * if (errors != null && errors.size() > 0) { saveErrors(request,
		 * errors); return mapping.findForward(FWD_FAIL); }
		 */
		String selectSampleSourceId = dynaForm.getString("sampleSourceId");
		UserSessionData usd = (UserSessionData) request.getSession().getAttribute(USER_SESSION_DATA);
		usd.setLoginLocationId(selectSampleSourceId);
		request.getSession().setAttribute(USER_SESSION_DATA, usd);

		return mapping.findForward(forward);
	}

	protected String getPageTitleKey() {
		return null;
	}

	protected String getPageSubtitleKey() {
		return null;
	}
}
