<%@ page language="java" contentType="text/html; charset=utf-8" %>
<%@ page import="us.mn.state.health.lims.common.action.IActionConstants,
				 us.mn.state.health.lims.common.util.SystemConfiguration,
                 us.mn.state.health.lims.common.util.ConfigurationProperties,
			     us.mn.state.health.lims.common.util.ConfigurationProperties.Property,
			     us.mn.state.health.lims.common.provider.validation.AccessionNumberValidatorFactory,
			     us.mn.state.health.lims.common.provider.validation.IAccessionNumberValidator,
                 us.mn.state.health.lims.common.util.Versioning,
                 us.mn.state.health.lims.common.formfields.FormFields,
			     us.mn.state.health.lims.common.formfields.FormFields.Field,
			     us.mn.state.health.lims.common.util.StringUtil" %>

<%@ taglib uri="/tags/struts-bean"		prefix="bean" %>
<%@ taglib uri="/tags/struts-html"		prefix="html" %>
<%@ taglib uri="/tags/struts-logic"		prefix="logic" %>
<%@ taglib uri="/tags/labdev-view"		prefix="app" %>
<%@ taglib uri="/tags/sourceforge-ajax" prefix="ajax"%>

<bean:define id="formName"		value='<%=(String) request.getAttribute(IActionConstants.FORM_NAME)%>' />
<bean:define id="accessionFormat" value='<%=ConfigurationProperties.getInstance().getPropertyValue(Property.AccessionFormat)%>' />

<%!
	String basePath = "";
	IAccessionNumberValidator accessionNumberValidator;
	boolean supportSTNumber = true;
	boolean supportSubjectNumber = true;
	boolean supportNationalID = true;
	boolean supportFirstNameFirst;
 %>
<%
	String path = request.getContextPath();
basePath = path + "/";

	accessionNumberValidator = new AccessionNumberValidatorFactory().getValidator();
	supportSTNumber = FormFields.getInstance().useField(Field.StNumber);
 	supportSubjectNumber = FormFields.getInstance().useField(Field.SubjectNumber);
 	supportNationalID = FormFields.getInstance().useField(Field.NationalID);
 	supportFirstNameFirst = FormFields.getInstance().useField(Field.FirstNameFirst);
%>

<script type="text/javascript" src="<%=basePath%>scripts/utilities.js?ver=<%= Versioning.getBuildNumber() %>" ></script>
<script type="text/javascript" src="<%=basePath%>scripts/ajaxCalls.js?ver=<%= Versioning.getBuildNumber() %>" ></script>

<script type="text/javascript" >
var NO_VALUE = "";
var supportFirstNameFirst = <%= supportFirstNameFirst %>;
var supportSTNumber = <%= supportSTNumber %>;
var supportSubjectNumber = <%= supportSubjectNumber %>;
var supportNationalID = <%= supportNationalID %>;
var patientSelectID;

function validateEntrySize( elementValue ){
	$("retrieveTestsID").disabled = (elementValue.length == 0);
}

function setSearch(){
    $("searchID").disabled = $jq.grep($jq('td[headers="patient"] input'), function(input){ return input.value.length > 0 }).length === 0;
}

function doShowTests(){
	$("patientSearchDiv").style.display = "none";
	var form = document.forms[0];
	form.action = '<%=formName%>'.sub('Form','') + ".do?accessionNumber="  + $("searchAccessionID").value + "&patientID=" + patientSelectID;
	form.submit();
}

function doSelectionSearch(){

//	var requestDate = $("receptionDate").value;
	
//	if( requestDate == null || requestDate == ""){
var patientIdentifier = $("patientID").value.toUpperCase();
		patientSearch($("lastName").value, $("firstName").value, $("middleName").value, patientIdentifier, patientIdentifier, patientIdentifier, NO_VALUE, processSearchSuccess, processSearchFailure);
//	}else{ }
}

function processSearchSuccess(xhr)
{
	//alert( xhr.responseText );

	var formField = xhr.responseXML.getElementsByTagName("formfield").item(0);
	var message = xhr.responseXML.getElementsByTagName("message").item(0);
	var table = $("searchResultTable");

	clearTable(table);

	if( message.firstChild.nodeValue == "valid" )
	{
		$("noPatientFound").hide();
		$("patientSearchDiv").show();

		var resultNodes = formField.getElementsByTagName("result");

		for( var i = 0; i < resultNodes.length; i++ ){
			addPatientToSearch( table, resultNodes.item(i) );
		}	
		
		$("retrieveTestsID").disabled = "";
	}else{
		$("patientSearchDiv").hide();
		$("noPatientFound").show();
		selectPatientId = "";
	}
}

function clearTable(table){
	var rows = table.rows.length - 1;
	while( rows > 0 ){
		table.deleteRow( rows-- );
	}
}

function addPatientToSearch(table, result ){
	var patient = result.getElementsByTagName("patient")[0];

	var firstName = getValueFromXmlElement( patient, "first");
	var middleName = getValueFromXmlElement( patient, "middle");
	var lastName = getValueFromXmlElement( patient, "last");
	var gender = getValueFromXmlElement( patient, "gender");
	var DOB = getValueFromXmlElement( patient, "dob");
	var stNumber = getValueFromXmlElement( patient, "ST");
	var subjectNumber = getValueFromXmlElement( patient, "subjectNumber");
	var nationalID = getValueFromXmlElement( patient, "nationalID");
	var pk = getValueFromXmlElement( result, "id");

	var row = createRow( table, firstName, middleName, lastName, gender, DOB, stNumber, subjectNumber, nationalID, pk );

	if( row == 1 ){
		patientSelectID = pk;
		$("sel_1").checked = "true";
		selectPatientId = pk;
	}
}


function getValueFromXmlElement( parent, tag ){
	var element = parent.getElementsByTagName( tag );

	return (element && element.length > 0) ? element[0].firstChild.nodeValue : "";
}

function createRow(table, firstName, middleName, lastName, gender, DOB, stNumber, subjectNumber, nationalID, pk){

		var row = table.rows.length;

		var newRow = table.insertRow(row);

		newRow.id = "_" + row;

		var cellCounter = -1;

		var selectionCell = newRow.insertCell(++cellCounter);
        if (supportFirstNameFirst) {
            var firstNameCell = newRow.insertCell(++cellCounter);
            var middleNameCell = newRow.insertCell(++cellCounter);
            var lastNameCell = newRow.insertCell(++cellCounter);
        } else {
            var lastNameCell = newRow.insertCell(++cellCounter);
            var firstNameCell = newRow.insertCell(++cellCounter);
            var middleNameCell = newRow.insertCell(++cellCounter);
        }
		var genderCell = newRow.insertCell(++cellCounter);
		var dobCell = newRow.insertCell(++cellCounter);
		var stCell = supportSTNumber ? newRow.insertCell(++cellCounter) : null;
		var subjectNumberCell = supportSubjectNumber ? newRow.insertCell(++cellCounter) : null;
		var nationalCell = supportNationalID ? newRow.insertCell(++cellCounter) : null;

		selectionCell.innerHTML = getSelectionHtml( row, pk );
		lastNameCell.innerHTML = nonNullString( lastName );
		firstNameCell.innerHTML = nonNullString( firstName );
		middleNameCell.innerHTML = nonNullString( middleName );
		genderCell.innerHTML = nonNullString( gender );
		if( supportSTNumber){stCell.innerHTML = nonNullString( stNumber );}
		if( supportSubjectNumber){subjectNumberCell.innerHTML = nonNullString( subjectNumber );}
		if( supportNationalID){nationalCell.innerHTML = nonNullString( nationalID );}

		dobCell.innerHTML = nonNullString( DOB );

		return row;
}

function getSelectionHtml( row, key){
	return "<input name='selPatient' id='sel_" + row + "' value='" + key + "' onclick='patientSelectID = this.value' type='radio'>";
}

function /*String*/ nonNullString( target ){
	return target == "null" ? "" : target;
}

function processSearchFailure(xhr)
{
	//alert( xhr.responseText );
	alert("<bean:message key="error.system"/>");
}
function /*void*/ handleEnterEvent(  ){
	if( $("searchAccessionID").value.length > 0){
		doShowTests();
	}
	return false;
}

function makeExclusive(inputElement){
	var row = inputElement.parentNode.parentNode;
	var cells = row.cells;
	var i = 0;
	var headerValue;
	
	if( inputElement.value == null || inputElement.value == ""){
		for(; i < cells.length; i++ ){
			cells[i].childNodes[1].disabled = "";
		}
	}else{
		headerValue = inputElement.parentNode.headers;
		for(; i < cells.length; i++ ){
			if( cells[i].headers != headerValue){
				cells[i].childNodes[1].disabled="disabled";
			}
		}
	}
	

}

function toUppercase(element){
    element.value = element.value.toUpperCase();
}


jQuery(function(){

    jQuery(".edit-sample").on("keypress", "input", function(event){
        if(event.which == 13 && jQuery(this).val().length > 0) {
            setSearch();
            doSelectionSearch();
        }
    });

    jQuery("#searchID").on("keypress", function(event){
        if(event.which == 13) {
            doSelectionSearch();
        }
    });

})

</script>


<div id="PatientPage" class="colorFill" style="display:inline" >

	<h2><bean:message key="sample.entry.search"/></h2>
	<table style="width:100%" class="edit-sample">
	<tr>
		<th rowspan="2" id="accession"><%=StringUtil.getContextualMessageForKey("quick.entry.accession.number")%></th>
		<th colspan="4" id="patient" ><bean:message key="banner.menu.patient"/></th>
<!-- 		<th rowspan="2" id="receptionDate" >Reception Date</th>  -->
	</tr>
	<tr>
        <% if(supportFirstNameFirst) { %>
            <th><bean:message key="patient.epiFirstName"/></th>
            <th><bean:message key="patient.epiMiddleName"/></th>
            <th><bean:message key="patient.epiLastName"/></th>
        <% } else { %>
            <th><bean:message key="patient.epiLastName"/></th>
            <th><bean:message key="patient.epiFirstName"/></th>
            <th><bean:message key="patient.epiMiddleName"/></th>
        <% } %>
		<th><%=StringUtil.getContextualMessageForKey("patient.search.all_IDs") %></th>
	</tr>
	<tr >
		<td headers="accession" >
			<input name="searchAccession"
			       style="display:table-cell; width:96%"
			       id="searchAccessionID"
			       maxlength="<%= Integer.toString(accessionNumberValidator.getMaxAccessionLength()) %>"
			       onkeyup="validateEntrySize( this.value );"
			       onblur="validateEntrySize( this.value );  makeExclusive(this);"
			       class="text"
			       type="text">
		</td>
		<% if(supportFirstNameFirst) { %>
            <td headers="patient" >
                <input name="searchPatientFirstName"
                       style="display:table-cell; width:96%"
                       id="firstName"
                       class="text"
                       type="text"
                       onkeyup="setSearch(); "
                       onblur="makeExclusive(this);"
                       >
            </td>
            <td headers="patient" >
                <input name="searchPatientMiddleName"
                       style="display:table-cell; width:96%"
                       id="middleName"
                       class="text"
                       type="text"
                       onkeyup="setSearch(); "
                       onblur="makeExclusive(this);"
                       >
            </td>
            <td headers="patient" >
                <input name="searchPatientLastName"
                       style="display:table-cell; width:96%"
                       id="lastName"
                       class="text"
                       type="text"
                       onkeyup="setSearch(); "
                       onblur="makeExclusive(this);"
                       >
            </td>
        <%} else {%>
            <td headers="patient" >
                <input name="searchPatientLastName"
                       style="display:table-cell; width:96%"
                      id="lastName"
                      class="text"
                      type="text"
                      onkeyup="setSearch(); "
                      onblur="makeExclusive(this);"
                      >
            </td>
            <td headers="patient" >
                <input name="searchPatientFirstName"
                       style="display:table-cell; width:96%"
                       id="firstName"
                       class="text"
                       type="text"
                       onkeyup="setSearch(); "
                       onblur="makeExclusive(this);"
                       >
                </td>
            <td headers="patient" >
                <input name="searchPatientMiddleName"
                       style="display:table-cell; width:96%"
                       id="middleName"
                       class="text"
                       type="text"
                       onkeyup="setSearch(); "
                       onblur="makeExclusive(this);"
                       >
            </td>
        <% } %>
		<td headers="patient">
			<input name="searchPatientID"
			       style="display:table-cell; width:96%"
			       id="patientID"
			       class="text"
			       type="text"
			       onkeyup="setSearch(); "
			       onblur="makeExclusive(this)"
			       onchange="toUppercase(this)"
			       autofocus="autofocus"
			       >
		</td>
<!-- 		<td headers="receptionDate">
			<input name="searchReceptionDate"
			       size="40"
			       id="receptionDate"
			       class="text"
			       type="text"
			       onkeyup="setSearch(); "
			       onblur="makeExclusive(this);">
		</td>  -->
	</tr>

	</table>
	<div id="noPatientFound"  style="display: none" >
		<p class="results-message"><bean:message key="patient.search.not.found"/></p>
	</div>
	<div id="patientSearchDiv" style="display:none">
		<table id="searchResultTable" style="width:100%">
			<tr>
				<th width="2%"></th>
				<% if(supportFirstNameFirst){ %>
                    <th width="15%">
                        <bean:message key="patient.epiFirstName"/>
                    </th>
                    <th width="15%">
                        <bean:message key="patient.epiMiddleName"/>
                    </th>
                    <th width="18%">
                        <bean:message key="patient.epiLastName"/>
                    </th>
				<%} else {%>
                    <th width="18%">
                        <bean:message key="patient.epiLastName"/>
                    </th>
                    <th width="15%">
                        <bean:message key="patient.epiFirstName"/>
                    </th>
                    <th width="15%">
                        <bean:message key="patient.epiMiddleName"/>
                    </th>
                  <% } %>
				<th width="5%">
					<bean:message key="patient.gender"/>
				</th>
				<th width="11%">
					<bean:message key="patient.birthDate"/>
				</th>
				<% if(supportSTNumber){ %>
				<th width="12%">
					<bean:message key="patient.ST.number"/>
				</th>
				<% } %>
				<% if(supportSubjectNumber){ %>
				<th width="12%">
					<bean:message key="patient.subject.number"/>
				</th>
				<% } %>
				<% if(supportNationalID){ %>
				<th width="12%">
					<%=StringUtil.getContextualMessageForKey("patient.NationalID") %>
				</th>
				<% } %>
			</tr>
	</table>
	</div>
	<button type="button"  id="searchID" onclick="doSelectionSearch();" disabled="disabled" ><bean:message key="label.button.search"/></button>
	<button type="button"  id="retrieveTestsID" onclick="doShowTests();" disabled="disabled" ><%= StringUtil.getContextualMessageForKey("resultsentry.accession.search") %></button>
</div>



