<%@ page language="java"
	contentType="text/html; charset=utf-8"
	import="java.util.Date,
	us.mn.state.health.lims.common.action.IActionConstants,
	us.mn.state.health.lims.common.util.SystemConfiguration,
	us.mn.state.health.lims.common.util.StringUtil" %>

<%@ taglib uri="/tags/struts-bean" prefix="bean" %>
<%@ taglib uri="/tags/struts-html" prefix="html" %>
<%@ taglib uri="/tags/struts-logic" prefix="logic" %>
<%@ taglib uri="/tags/labdev-view" prefix="app" %>
<%@ taglib uri="/tags/sourceforge-ajax" prefix="ajax"%>

<bean:define id="formName" value='<%= (String)request.getAttribute(IActionConstants.FORM_NAME) %>' />

<script language="JavaScript1.2">
    function validateForm(form) {
        return validateLoginLocationForm(form);
    }

</script>
<table width="50%">
<tr>
    <td width="50%" valign="top">
        <table width="95%">
        <tr>
            <td width="20%">&nbsp;</td>
            <td colspan="2">
                <bean:message key="login.location.selection"/>
            </td>
            <td width="20%">&nbsp;</td>
            <td>
                <html:select styleId="sampleSourceID" name="<%=formName%>" property="sampleSourceId">
                    <html:option value=""></html:option>
                    <html:optionsCollection name="<%=formName%>" property="sampleSourceList" label="name" value="id" />
                </html:select>
            </td>
        </tr>
        </table>
        <br>
    </td>
</tr>
</table>


<table width="100%">
<tr>
    <td width="50%" valign="top">
        <table width="95%">
        <tr><td colspan="4">&nbsp;</td>
        <tr>
            <td width="20%">&nbsp;</td>
            <td width="10%" noWrap>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td colspan="2" align="left">
                <html:button onclick="setAction(window.document.forms[0], 'Update', 'yes', '');"  property="save" >
  		            <bean:message key="label.button.select"/>
                </html:button>
            </td>
        </tr>
        </table>
    </td>
</tr>
</table>

<app:javascript formName="loginLocationForm"/>


