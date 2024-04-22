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

import org.apache.commons.validator.GenericValidator;
import us.mn.state.health.lims.common.valueholder.BaseObject;

public class SystemUserLocation extends BaseObject {

	private static final long serialVersionUID = 1L;

	private SystemUserLocationPK compoundId = new SystemUserLocationPK();
	private String userName;
	private String locationName;
	private String uniqueIdentifyer;
	
	public void setCompoundId(SystemUserLocationPK compoundId) {
		uniqueIdentifyer = null;
		this.compoundId = compoundId;
	}

	public SystemUserLocationPK getCompoundId() {
		return compoundId;
	}

	public String getId(){
		return compoundId == null ? "0" : compoundId.getSystemUserId() + compoundId.getLocationId();
	}
	
	public void setSystemUserId(String systemUserId) {
		uniqueIdentifyer = null;
		compoundId.setSystemUserId(systemUserId);
	}

	public String getSystemUserId() {
		return compoundId == null ? null : compoundId.getSystemUserId();
	}

	public void setLocationId(String locationId) {
		uniqueIdentifyer = null;
		compoundId.setLocationId(locationId);
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public String getLocationId() {
		return compoundId == null ? null : compoundId.getLocationId();
	}

	public void setUniqueIdentifyer(String uniqueIdentifyer) {
		this.uniqueIdentifyer = uniqueIdentifyer;
	}

	public String getUniqueIdentifyer() {
		if( GenericValidator.isBlankOrNull(uniqueIdentifyer)){
			uniqueIdentifyer = getSystemUserId() + "-" + getLocationId();
		}
		return uniqueIdentifyer;
	}
	
	
}
