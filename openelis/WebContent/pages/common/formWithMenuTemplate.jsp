<!DOCTYPE html>
<%@ page language="java"
	contentType="text/html; charset=utf-8"
	import="org.apache.struts.util.RequestUtils,org.apache.struts.action.*,org.apache.struts.Globals,java.util.Iterator,javax.servlet.jsp.JspException"
	import="us.mn.state.health.lims.common.action.IActionConstants"
	import="us.mn.state.health.lims.common.util.StringUtil"
	import="us.mn.state.health.lims.common.util.resources.ResourceLocator"
    import="us.mn.state.health.lims.common.util.Versioning"
    import="us.mn.state.health.lims.common.util.SystemConfiguration"
 %>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>
<%@ taglib uri="/WEB-INF/struts-bean.tld" prefix="bean" %>
<%@ taglib uri="/WEB-INF/struts-tiles.tld" prefix="tiles" %>
<%@ taglib uri="/WEB-INF/struts-logic.tld" prefix="logic" %>
<%--bugzilla 2492--%>
<html:html>
<bean:define id="formName" value='<%= (String)request.getAttribute(IActionConstants.FORM_NAME) %>' />
<%!
String path = "";
String basePath = "";
String chosenLanguage = "";
%>
<%
path = request.getContextPath();
basePath = path + "/";
chosenLanguage = SystemConfiguration.getInstance().getDefaultLocale().toLanguageTag()+"";

String form = (String)request.getAttribute(IActionConstants.FORM_NAME);

if (form == null) {
	form = "n/a";
}

  int startingRecNo = 1;
  
  if (request.getAttribute("startingRecNo") != null) {
       startingRecNo = Integer.parseInt((String)request.getAttribute("startingRecNo"));
  }
  
   request.setAttribute("ctx", request.getContextPath());   

%>

<head>
<% if (chosenLanguage.equalsIgnoreCase("ar-AR")) { %>
<link rel="stylesheet" type="text/css" href="<%=basePath%>css/openElisCore-rtl.css?ver=<%= Versioning.getBuildNumber() %>" />
<% } else { %>
<link rel="stylesheet" type="text/css" href="<%=basePath%>css/openElisCore.css?ver=<%= Versioning.getBuildNumber() %>" />
<% } %>
<script type="text/javascript" src="<%=basePath%>scripts/jquery-1.8.0.min.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/jquery.dataTables.min.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/bootstrap.min.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/tabs.jsp"></script> 
<script type="text/javascript" src="<%=basePath%>scripts/utilities.jsp"></script> 
<script type="text/javascript" src="<%=basePath%>scripts/prototype-1.5.1.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/scriptaculous.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/overlibmws.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/ajaxtags-1.2.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/treeScript.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/Tooltip-0.6.0.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script type="text/javascript" src="<%=basePath%>scripts/lightbox.js?ver=<%= Versioning.getBuildNumber() %>"></script>
<script language="JavaScript1.2">

//bugzilla 2020, bugzilla 2339
function init() {
    check_width();
    //bugzilla 2020 menu tabs are not being initialized and highlighted
    initMenu();
}

// bugzilla 2339 for Mozilla browsers
if (document.addEventListener) {  
  document.addEventListener("DOMContentLoaded", init, false);
} else {
  window.onload = init; 
}

function setAction(form, action, validate, parameters) {
   
    //alert("Iam in setAction " + form.name + " " + form.action);
   //for (var i = 0; i < form.elements.length; i++) {
    
      //alert("This is a form element " + form.elements[i].name + " " + form.elements[i].value);
       
    //}
    
    var sessionid = getSessionFromURL(form.action);
	var context = '<%= request.getContextPath() %>';
	var formName = form.name; 
	//alert("form name " + formName);
	var parsedFormName = formName.substring(1, formName.length - 4);
	parsedFormName = formName.substring(0,1).toUpperCase() + parsedFormName;
    //alert("parsedFormName " + parsedFormName);
    
    var idParameter = <%= (String)request.getParameter("ID") %>;
    var startingRecNoParameter = <%= (String)request.getParameter("startingRecNo")%>;
    //alert("This is idParameter " + idParameter);   
    if (!idParameter) {
       idParameter = '0';
    }
    
    if (!startingRecNoParameter) {
       startingRecNoParameter = '1';
    }
       
    if (parameters != '') {
	   parameters = parameters + idParameter;
	} else {
	   parameters = parameters + "?ID=" + idParameter;
	}
    parameters = parameters + "&startingRecNo=" + startingRecNoParameter;
	
	
	form.action = context + '/' + action + parsedFormName + ".do"  + sessionid + parameters ;
	form.validateDocument = new Object();
	form.validateDocument.value = validate;
	//alert("Going to validatedAnDsubmitForm this is action " + form.action);
	validateAndSubmitForm(form);
	
}

</script>
<%
	if (request.getAttribute("cache") != null && request.getAttribute("cache").toString().equals("false")) 
	{
%>	
		<meta http-equiv="Cache-Control" content="no-cache, no-store, proxy-revalidate, must-revalidate"/> <%-- HTTP 1.1 --%>
		<meta http-equiv="Pragma" content="no-cache"/> <%-- HTTP 1.0 --%>
		<meta http-equiv="Expires" content="0"/> 
<%
	}
%>
	
	<title>
		<logic:notEmpty name="<%=IActionConstants.PAGE_TITLE_KEY%>">
			<bean:write name="<%=IActionConstants.PAGE_TITLE_KEY%>" scope='request' />
		</logic:notEmpty>
		<logic:empty name="<%=IActionConstants.PAGE_TITLE_KEY%>">
			<%=StringUtil.getContextualMessageForKey("title.default")%>
		</logic:empty>	
	</title>
	<tiles:insert attribute="banner"/>
    <tiles:insert attribute="login"/>
</head>


<%--html:errors/--%>

<%--bugzilla 1400--%><%--bugzilla 1664 check_width()--%>
<body onLoad="focusOnFirstInputField();check_width();onLoad()" >

<%--action is set in BaseAction--%>

<!-- for optimistic locking-->
<html:hidden property="lastupdated" name="<%=formName%>" />
	<table cellpadding="0" cellspacing="1" width="100%">
			<tr>
				<td>
					<tiles:insert attribute="error"/>
				</td>
			</tr>
			 <% if (request.getAttribute(IActionConstants.ACTION_KEY) != null) { %>
                <form name='<%=(String)request.getAttribute(IActionConstants.FORM_NAME) %>' action='<%=(String)request.getAttribute(IActionConstants.ACTION_KEY) %>' onSubmit="return submitForm(this);" method="POST">
             <% } %>
			<tr>
				<td>
					<tiles:insert attribute="header"/>
				</td>
			</tr>
            <tr>
				<td>
					<tiles:insert attribute="preSelectionHeader"/>
				</td>
			</tr>
			<tr>
				<td>
		        	<tiles:insert attribute="body"/>
				</td>
			</tr>
			<tr>
				<td>
					<tiles:insert attribute="footer"/>
				</td>
			</tr>
			<% if (request.getAttribute(IActionConstants.ACTION_KEY) != null) { %>
                 </form>
            <% } %>

	</table>

</body>



</html:html>

