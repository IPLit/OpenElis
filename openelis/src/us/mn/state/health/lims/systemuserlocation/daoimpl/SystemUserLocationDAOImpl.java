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
package us.mn.state.health.lims.systemuserlocation.daoimpl;

import org.apache.commons.beanutils.PropertyUtils;
import org.hibernate.Query;
import org.hibernate.exception.ConstraintViolationException;
import us.mn.state.health.lims.audittrail.dao.AuditTrailDAO;
import us.mn.state.health.lims.audittrail.daoimpl.AuditTrailDAOImpl;
import us.mn.state.health.lims.common.action.IActionConstants;
import us.mn.state.health.lims.common.daoimpl.BaseDAOImpl;
import us.mn.state.health.lims.common.exception.LIMSRuntimeException;
import us.mn.state.health.lims.common.log.LogEvent;
import us.mn.state.health.lims.hibernate.HibernateUtil;
import us.mn.state.health.lims.systemuserlocation.SystemUserLocation;
import us.mn.state.health.lims.systemuserlocation.SystemUserLocationDAO;
import us.mn.state.health.lims.systemuserlocation.SystemUserLocationPK;

import java.util.List;
import java.util.Vector;

public class SystemUserLocationDAOImpl extends BaseDAOImpl implements SystemUserLocationDAO {

	public void deleteData(List<SystemUserLocation> systemUserLocations) throws LIMSRuntimeException {
		//add to audit trail
		try {
			AuditTrailDAO auditDAO = new AuditTrailDAOImpl();
			
			for( SystemUserLocation data: systemUserLocations){

				SystemUserLocation oldData = readUserLocation(data.getCompoundId());
				SystemUserLocation newData = new SystemUserLocation();

				String sysUserId = data.getSysUserId();
				String event = IActionConstants.AUDIT_TRAIL_DELETE;
				String tableName = "SYSTEM_USER_LOCATION";
				auditDAO.saveHistory(newData,oldData,sysUserId,event,tableName);
			}
		}  catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","AuditTrail deleteData()",e.toString());
			throw new LIMSRuntimeException("Error in SystemUserLocation AuditTrail deleteData()", e);
		}  
		
		try {		
			for (SystemUserLocation data: systemUserLocations) {
				data = (SystemUserLocation) readUserLocation(data.getCompoundId());
				HibernateUtil.getSession().delete(data);
				HibernateUtil.getSession().flush();
				HibernateUtil.getSession().clear();
			}			
		} catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","deleteData()",e.toString());
			throw new LIMSRuntimeException("Error in SystemUserLocation deleteData()",e);
		}
	}

	public boolean insertData(SystemUserLocation systemUserLocation) throws LIMSRuntimeException{

		try {
			SystemUserLocationPK id = (SystemUserLocationPK)HibernateUtil.getSession().save(systemUserLocation);
			systemUserLocation.setCompoundId(id);
			
			AuditTrailDAO auditDAO = new AuditTrailDAOImpl();
			String sysUserId = systemUserLocation.getSysUserId();
			String tableName = "SYSTEM_USER_LOCATION";
			auditDAO.saveNewHistory(systemUserLocation,sysUserId,tableName);
			
			HibernateUtil.getSession().flush();
			HibernateUtil.getSession().clear();
						
		} catch(ConstraintViolationException cve){
			LogEvent.logError("SystemUserLocationDAOImpl","insertData()-- duplicate record",cve.toString());
			throw new LIMSRuntimeException("Error in systemUserLocation insertData()-- duplicate record");
		}catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","insertData()",e.toString());
			throw new LIMSRuntimeException("Error in systemUserLocation insertData()",e);
		} 
		
		return true;
	}

	public void updateData(SystemUserLocation systemUserLocation) throws LIMSRuntimeException {
		
		SystemUserLocation oldData = readUserLocation(systemUserLocation.getCompoundId());
		SystemUserLocation newData = systemUserLocation;

		try {
			AuditTrailDAO auditDAO = new AuditTrailDAOImpl();
			String sysUserId = systemUserLocation.getSysUserId();
			String event = IActionConstants.AUDIT_TRAIL_UPDATE;
			String tableName = "SYSTEM_USER_LOCATION";
			auditDAO.saveHistory(newData,oldData,sysUserId,event,tableName);
		}  catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","AuditTrail updateData()",e.toString());
			throw new LIMSRuntimeException("Error in  AuditTrail updateData()", e);
		}  
							
		try {
			HibernateUtil.getSession().merge(systemUserLocation);
			HibernateUtil.getSession().flush();
			HibernateUtil.getSession().clear();
			HibernateUtil.getSession().evict(systemUserLocation);
			HibernateUtil.getSession().refresh(systemUserLocation);
		} catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","updateData()",e.toString());
			throw new LIMSRuntimeException("Error in systemUserLocation updateData()",e);
		}
	}

	public void getData(SystemUserLocation systemUserLocation) throws LIMSRuntimeException {
		try {
			SystemUserLocation tmpUserLocation = (SystemUserLocation)HibernateUtil.getSession().get(SystemUserLocation.class, systemUserLocation.getCompoundId());
			HibernateUtil.getSession().flush();
			HibernateUtil.getSession().clear();
			if (tmpUserLocation != null) {
				PropertyUtils.copyProperties(systemUserLocation, tmpUserLocation);
			} else {
				systemUserLocation.setCompoundId(null);
			}
		} catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","getData()",e.toString());
			throw new LIMSRuntimeException("Error in systemUserLocation getData()", e);
		}
	}

	public List getAllUserLocations() throws LIMSRuntimeException {
		List list = new Vector();
		try {
			String sql = "from SystemUserLocation";
			Query query = HibernateUtil.getSession().createQuery(sql);
			list = query.list();
			HibernateUtil.getSession().flush();
			HibernateUtil.getSession().clear();
		} catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","getAllUserLocations()",e.toString());
			throw new LIMSRuntimeException("Error in systemUserLocation getAllUserLocations()", e);
		}

		return list;
	}


	public SystemUserLocation readUserLocation(SystemUserLocationPK systemUserLocationPK) {
		SystemUserLocation recoveredUserLocation = null;
		try {
			recoveredUserLocation = (SystemUserLocation)HibernateUtil.getSession().get(SystemUserLocation.class, systemUserLocationPK);
			HibernateUtil.getSession().flush();
			HibernateUtil.getSession().clear();
		} catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","readUserLocation()",e.toString());
			throw new LIMSRuntimeException("Error in systemUserLocation readUserLocation()", e);
		}			
		
		return recoveredUserLocation;
	}


	@SuppressWarnings("unchecked")
	public List<String> getLocationIdsForUser(String userId) throws LIMSRuntimeException {
		List<String> userLocations = null;

		try{
			String sql = "select cast(location_id AS varchar) from system_user_location where system_user_id = :userId";
			Query query = HibernateUtil.getSession().createSQLQuery(sql);
			query.setInteger("userId", Integer.parseInt(userId));
			userLocations = query.list();
		} catch (Exception e) {
			LogEvent.logError("SystemUserLocationDAOImpl","getLocationIdsForUser()",e.toString());
			throw new LIMSRuntimeException("Error in SystemUserLocationDAOImpl getLocationIdsForUser()", e);
		}
		return userLocations;
	}

}
