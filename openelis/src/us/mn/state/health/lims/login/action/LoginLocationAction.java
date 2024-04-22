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
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.DynaActionForm;
import us.mn.state.health.lims.common.action.BaseAction;
import us.mn.state.health.lims.samplesource.dao.SampleSourceDAO;
import us.mn.state.health.lims.samplesource.daoimpl.SampleSourceDAOImpl;
import us.mn.state.health.lims.samplesource.valueholder.SampleSource;
import us.mn.state.health.lims.systemuserlocation.SystemUserLocationDAO;
import us.mn.state.health.lims.systemuserlocation.daoimpl.SystemUserLocationDAOImpl;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Hung Nguyen (Hung.Nguyen@health.state.mn.us)
 */
public class LoginLocationAction extends BaseAction {

    protected ActionForward performAction(ActionMapping mapping,
                                          ActionForm form, HttpServletRequest request,
                                          HttpServletResponse response) throws Exception {

        String forward = FWD_SUCCESS;

        DynaActionForm dynaForm = (DynaActionForm) form;
        String sysUserId = getSysUserId(request);
        SystemUserLocationDAO systemUserLocationDAO = new SystemUserLocationDAOImpl();
        List<String> locationIdsForUser = systemUserLocationDAO.getLocationIdsForUser(sysUserId);
        SampleSourceDAO sampleSourceDAO = new SampleSourceDAOImpl();
        ArrayList<SampleSource> locationsForUser = new ArrayList<>();
        for (String locationId : locationIdsForUser) {
            SampleSource sampleSource = sampleSourceDAO.get(locationId);
            locationsForUser.add(sampleSource);
        }

        PropertyUtils.setProperty(dynaForm, "sampleSourceList", locationsForUser);

        return mapping.findForward(forward);
    }

    protected String getPageTitleKey() {
        return "login.locationSelection";
    }

    protected String getPageSubtitleKey() {
        return "login.locationSelection";
    }
}
