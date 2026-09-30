package org.bahmni.openelis.api;

import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import us.mn.state.health.lims.login.valueholder.UserSessionData;
import us.mn.state.health.lims.samplesource.dao.SampleSourceDAO;
import us.mn.state.health.lims.samplesource.daoimpl.SampleSourceDAOImpl;
import us.mn.state.health.lims.samplesource.valueholder.SampleSource;
import us.mn.state.health.lims.systemuserlocation.SystemUserLocation;
import us.mn.state.health.lims.systemuserlocation.SystemUserLocationDAO;
import us.mn.state.health.lims.systemuserlocation.daoimpl.SystemUserLocationDAOImpl;
import us.mn.state.health.lims.common.action.IActionConstants;

import java.util.List;

import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/loginLocation")
@MultipartConfig
public class LoginLocation extends HttpServlet {

    private static Logger logger = LogManager.getLogger(LoginLocation.class);

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws javax.servlet.ServletException, java.io.IOException {
        try {
            String locationStr = request.getParameter("locationName");
            if (StringUtils.isNotBlank(locationStr)) {
                UserSessionData usd = (UserSessionData) request.getSession().getAttribute(IActionConstants.USER_SESSION_DATA);
                String sysUserId = String.valueOf(usd.getSystemUserId());
                SystemUserLocationDAO systemUserLocationDAO = new SystemUserLocationDAOImpl();
                List<String> locationIdsForUser = systemUserLocationDAO.getLocationIdsForUser(sysUserId);
                SampleSourceDAO sampleSourceDAO = new SampleSourceDAOImpl();
                for (String locationId : locationIdsForUser) {
                    SampleSource sampleSource = sampleSourceDAO.get(locationId);
                    if (sampleSource!=null && sampleSource.getName().equalsIgnoreCase(locationStr)) {
                        String sampleSourceId = sampleSource.getId();
                        UserSessionData usdToSet = (UserSessionData) request.getSession().getAttribute(IActionConstants.USER_SESSION_DATA);
                        usdToSet.setLoginLocationId(sampleSourceId);
                        request.getSession().setAttribute(IActionConstants.USER_SESSION_DATA, usdToSet);
                        break;
                    }
                }
            }
        } catch (Exception lre) {
            logger.error("Errors in post api LoginLocation ", lre.getMessage());
        }
    }

}
