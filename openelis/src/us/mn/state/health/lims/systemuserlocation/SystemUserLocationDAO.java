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
package us.mn.state.health.lims.systemuserlocation;

import us.mn.state.health.lims.common.dao.BaseDAO;
import us.mn.state.health.lims.common.exception.LIMSRuntimeException;

import java.util.List;

public interface SystemUserLocationDAO extends BaseDAO {

	public boolean insertData(SystemUserLocation systemUserLocation) throws LIMSRuntimeException;

	public void deleteData(List<SystemUserLocation> systemUserLocations) throws LIMSRuntimeException;

	public List getAllUserLocations() throws LIMSRuntimeException;

	public List<String> getLocationIdsForUser(String userId);

	public void getData(SystemUserLocation systemUserLocation) throws LIMSRuntimeException;

	public void updateData(SystemUserLocation systemUserLocation) throws LIMSRuntimeException;

}
