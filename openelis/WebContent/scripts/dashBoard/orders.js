
function order(div, orderArray, generateLink, getColumns, alwaysValidate, showPriorityColumn, showExtraColumns,currentChosenArLanguage) {
     this.div = div;
     this.orderArray = orderArray;
     this.columns = getColumns(showPriorityColumn, alwaysValidate, showExtraColumns);
     if (currentChosenArLanguage) {  // IPlit
        var moddedCols = [];
        let indexVar = 0;
        for (var i = (this.columns.length-1); i >= 0; --i) {
            var array_element = this.columns[i];
            array_element.index = indexVar;
            moddedCols.push(array_element);
            ++indexVar;
        }
        this.columns = moddedCols;
     }
     this.indexesOfNonSearchableColumns = function(){
                var indexes = [];

                jQuery.each(this.columns, function(id, column){

                    //we shouldn't add the id for the column if column.searchable is null.
                    // It assumes that we don't need to specify searchable property when the column is searchable
                    if (column.searchable == false){
                        indexes.push(column.index);
                    }
                });

                return indexes;
             }
    this.orderList = function (){

            if (this.orders) {
                return this.orders;
            }

            this.orders = jQuery.map(this.orderArray, function(order, i) {
                order.id= i;
                order.link = generateLink(order, alwaysValidate);
                order.name = order.firstName + (order.middleName ? " " + order.middleName : "") + (order.lastName ? " " +order.lastName : "");
                return order;
            });

            return this.orders;
         };
}

function generateLinkForPrint(order){
    var printMessage = jQuery("#translatedColumnNames").attr("data-link-print");
    var printIcon = '<img id="actionIcon" src="images/print.svg" title="'+ printMessage +'">';
    return "<a id='print' target='_blank' href='ReportPrint.do?type=patient&report=patientHaitiClinical&accessionDirect="+ order.accessionNumber +"&patientNumberDirect=" + order.stNumber + "'>"+printIcon+"</a>";
}


function generateAllLinksForOrder(order, alwaysValidate){
    if(order.accessionNumber == null){
        var linkSample = jQuery("#translatedColumnNames").attr("data-link-collectSample");
        return  "<a href='SamplePatientEntry.do?id="+ order.orderId +"&patientId=" + order.stNumber + "'>"+linkSample+"</a>";
    }
    var resultMessage = jQuery("#translatedColumnNames").attr("data-link-result");
    var resultIcon = '<img id="actionIcon" src="images/result.svg" title="'+resultMessage+'">';
    var enterResultLink;
    if(order.sampleType == null) {
        enterResultLink = "<a id='result' href='AccessionResults.do?accessionNumber=" + order.accessionNumber + "&referer=LabDashboard" + "'>" + resultIcon + "</a>";
    } else {
        var sampleType = order.sampleType.replace(/'/g, '%27');
       enterResultLink = "<a id='result' href='AccessionResults.do?accessionNumber=" + order.accessionNumber + "&sampleType=" + sampleType + "&referer=LabDashboard" + "'>" + resultIcon + "</a>";
    }

    var labelMessage = jQuery("#translatedColumnNames").attr("data-link-label");
    var labelIcon = '<img style="cursor: pointer" id="actionIcon" src="images/sampleLabelPrint.png" title="'+labelMessage+'">';
    var sampleLabelLink = "<a class='label' accessionNumber='"+order.accessionNumber+"' stNumber='"+order.stNumber+"' collectionDate='"+order.collectionDate+"' collectionDateStr='"+order.collectionDateString+"'>"+labelIcon+"</a>";


    if(alwaysValidate){
        //TODO: &type= is required in the url because of a bug I can't find the source of. The bug causes people without
        var validateMessage = jQuery("#translatedColumnNames").attr("data-link-validate");
        var validateIcon = '<img id="actionIcon" src="images/validate.svg" title="'+validateMessage+'">';
        var validationLink;
        if(order.sampleType == null) {
            validationLink = "<a id='validate' href='ResultValidationForAccessionNumber.do?accessionNumber=" + order.accessionNumber + "&patientId=" + order.stNumber + "&referer=LabDashboard&type=&test='>" + validateIcon + "</a>";
        } else {
            var sampleType = order.sampleType.replace(/'/g, '%27');
            validationLink  = "<a id='validate' href='ResultValidationForAccessionNumber.do?accessionNumber=" + order.accessionNumber + "&patientId=" + order.stNumber + "&sampleType=" + sampleType + "&referer=LabDashboard&type=&test='>" + validateIcon + "</a>";
        }
        return sampleLabelLink + " | " + enterResultLink + " | " + validationLink + " | " + generateLinkForPrint(order);
    }
    return sampleLabelLink + " | " + enterResultLink + " | " + generateLinkForPrint(order);
}

function getColumnsForTodayOrder(showPriorityColumn, alwaysValidate, showExtraColumns) {
    var extraColumnsWithValidationCount = [
        {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
        {id:"pendingValidationCount", name:jQuery("#translatedColumnNames").attr("data-pendingValidation"), field:"pendingValidationCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:140},
        {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:10, searchable:false, editor:Slick.Editors.Text, minWidth:170}
    ];
    var extraColumns = [
        {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
        {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:10, searchable:false, editor:Slick.Editors.Text, minWidth:170}
    ];
    if(showPriorityColumn) {
        if (alwaysValidate) {
            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:50},
                {id:"isCompleted", name:jQuery("#translatedColumnNames").attr("data-completed"), field:"isCompleted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:11, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:12, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumnsWithValidationCount).sort((a, b) => a.index - b.index);
            }
            return columns;
        }
        else {
            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:170},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:70},
                {id:"isCompleted", name:"Completed", field:"isCompleted", sortable:true, cssClass:"cell-title", index:9, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:10, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:11, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumns).sort((a, b) => a.index - b.index);
            }
            return columns;

        }
    } else {
        if (alwaysValidate) {
            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:50},
                {id:"isCompleted", name:jQuery("#translatedColumnNames").attr("data-completed"), field:"isCompleted", sortable:true, cssClass:"cell-title", index:8, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:9, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumnsWithValidationCount).sort((a, b) => a.index - b.index);
            }
            return columns;

        }
        else {
            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:170},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:5, searchable:false, minWidth:70},
                {id:"isCompleted", name:"Completed", field:"isCompleted", sortable:true, cssClass:"cell-title", index:7, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:8, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:9, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumns).sort((a, b) => a.index - b.index);
            }
            return columns;
        }
    }
}

function getColumnsForBacklogOrder(showPriorityColumn, alwaysValidate) {
    if(showPriorityColumn) {
        if (alwaysValidate) {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
                {id:"pendingValidationCount", name:jQuery("#translatedColumnNames").attr("data-pendingValidation"), field:"pendingValidationCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:140},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:50},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:9, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:10, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:11, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
        else {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:160},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:70},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:8, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:9, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
    } else {
        if (alwaysValidate) {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:4, searchable:false, minWidth:100},
                {id:"pendingValidationCount", name:jQuery("#translatedColumnNames").attr("data-pendingValidation"), field:"pendingValidationCount", sortable:true, editor:Slick.Editors.Text, index:5, searchable:false, minWidth:140},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:50},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:7, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:8, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:9, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
        else {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:160},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:4, searchable:false, minWidth:100},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:5, searchable:false, minWidth:70},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:6, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:7, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:8, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
    }
}

function getColumnsForSampleNotCollected(showPriorityColumn) {
    if(showPriorityColumn) {
        return [
            {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:0, minWidth:160},
            {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:1, editor:Slick.Editors.Text, minWidth:160},
            {id:"source", name:jQuery("#translatedColumnNames").attr("data-source"), field:"source", sortable:false, index:2, editor:Slick.Editors.Text, minWidth:160},
            {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
            {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
            {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
            {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:70},
            {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:7, editor:Slick.Editors.Text, minWidth:465},
            {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:8, editor:Slick.Editors.Text, searchable:false, minWidth:180}
        ];
    } else {
        return [
            {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:0, minWidth:160},
            {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:1, editor:Slick.Editors.Text, minWidth:160},
            {id:"source", name:jQuery("#translatedColumnNames").attr("data-source"), field:"source", sortable:false, index:2, editor:Slick.Editors.Text, minWidth:160},
            {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
            {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:4, searchable:false, minWidth:70},
            {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:5, editor:Slick.Editors.Text, minWidth:465},
            {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:6, editor:Slick.Editors.Text, searchable:false, minWidth:180}
        ];
    }
}


// here referred Out test count column will be visible in dashboard
function getColumnsForTodayOrderWithReferredOutTestsCountColumn(showPriorityColumn, alwaysValidate, showExtraColumns) {
    var extraColumnsWithValidationCount = [
        {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
        {id:"referredTestCount", name:jQuery("#translatedColumnNames").attr("data-referredTests"), field:"referredTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:80},
        {id:"pendingValidationCount", name:jQuery("#translatedColumnNames").attr("data-pendingValidation"), field:"pendingValidationCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:140},
        {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:10, searchable:false, editor:Slick.Editors.Text, minWidth:170}
    ];
    var extraColumns = [
        {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
        {id:"referredTestCount", name:jQuery("#translatedColumnNames").attr("data-referredTests"), field:"referredTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:80},
        {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:10, searchable:false, editor:Slick.Editors.Text, minWidth:170}
    ];
    if(showPriorityColumn) {
        if (alwaysValidate) {

            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:9, searchable:false, minWidth:50},
                {id:"isCompleted", name:jQuery("#translatedColumnNames").attr("data-completed"), field:"isCompleted", sortable:true, cssClass:"cell-title", index:11, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:12, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:13, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumnsWithValidationCount).sort((a, b) => a.index - b.index);
            }
            return columns;
        }
        else {

            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:170},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:70},
                {id:"isCompleted", name:"Completed", field:"isCompleted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:11, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:12, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumns).sort((a, b) => a.index - b.index);
            }
            return columns;
        }
    } else {
        if (alwaysValidate) {
            var columns =  [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:50},
                {id:"isCompleted", name:jQuery("#translatedColumnNames").attr("data-completed"), field:"isCompleted", sortable:true, cssClass:"cell-title", index:9, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:10, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:11, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumnsWithValidationCount).sort((a, b) => a.index - b.index);
            }
            return columns;
        }
        else {
            var columns = [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:170},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:70},
                {id:"isCompleted", name:"Completed", field:"isCompleted", sortable:true, cssClass:"cell-title", index:8, formatter:Slick.Formatters.YesNo, searchable:false, minWidth:120},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:9, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80},
            ];
            if (showExtraColumns) {
                return columns.concat(extraColumns).sort((a, b) => a.index - b.index);
            }
            return columns;

        }
    }
}


// here referred Out test count column will be visible in dashboard for backlog orders
function getColumnsForBacklogOrderWithReferredOutTestsCountColumn(showPriorityColumn, alwaysValidate) {
    if(showPriorityColumn) {
        if (alwaysValidate) {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
                {id:"referredTestCount", name:jQuery("#translatedColumnNames").attr("data-referredTests"), field:"referredTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:80},
                {id:"pendingValidationCount", name:jQuery("#translatedColumnNames").attr("data-pendingValidation"), field:"pendingValidationCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:140},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:9, searchable:false, minWidth:50},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:10, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:11, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:12, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
        else {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:160},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"sampleType", name:jQuery("#translatedColumnNames").attr("data-sampleType"), field:"sampleType", searchable:true, sortable:true, index:4, editor:Slick.Editors.Text, minWidth:160},
                {id:"priority", name:jQuery("#translatedColumnNames").attr("data-priority"), field:"priority", searchable:true, sortable:true, index:5, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:100},
                {id:"referredTestCount", name:jQuery("#translatedColumnNames").attr("data-referredTests"), field:"referredTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:80},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:8, searchable:false, minWidth:70},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:9, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:10, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:11, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
    } else {
        if (alwaysValidate) {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:120},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:140},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:4, searchable:false, minWidth:100},
                {id:"referredTestCount", name:jQuery("#translatedColumnNames").attr("data-referredTests"), field:"referredTestCount", sortable:true, editor:Slick.Editors.Text, index:5, searchable:false, minWidth:80},
                {id:"pendingValidationCount", name:jQuery("#translatedColumnNames").attr("data-pendingValidation"), field:"pendingValidationCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:140},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:50},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:8, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:9, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
        else {
            return [
                {id:"accessionNumber", name:jQuery("#translatedColumnNames").attr("data-accessionNumber"), field:"accessionNumber", sortable:true, index:0, editor:Slick.Editors.Text, minWidth:160},
                {id:"stNumber", name:jQuery("#translatedColumnNames").attr("data-patientID"), field:"stNumber", sortable:true, editor:Slick.Editors.Text, index:1, minWidth:160},
                {id:"name", name:jQuery("#translatedColumnNames").attr("data-patientName"), field:"name", sortable:true, index:2, editor:Slick.Editors.Text, minWidth:160},
                {id:"sectionNames", name:jQuery("#translatedColumnNames").attr("data-sectionNames"), field:"sectionNames", searchable:true, sortable:true, index:3, editor:Slick.Editors.Text, minWidth:160},
                {id:"pendingTestCount", name:jQuery("#translatedColumnNames").attr("data-pendingTests"), field:"pendingTestCount", sortable:true, editor:Slick.Editors.Text, index:4, searchable:false, minWidth:100},
                {id:"referredTestCount", name:jQuery("#translatedColumnNames").attr("data-referredTests"), field:"referredTestCount", sortable:true, editor:Slick.Editors.Text, index:6, searchable:false, minWidth:80},
                {id:"totalTestCount", name:jQuery("#translatedColumnNames").attr("data-total"), field:"totalTestCount", sortable:true, editor:Slick.Editors.Text, index:7, searchable:false, minWidth:70},
                {id:"notes", name:jQuery("#translatedColumnNames").attr("data-notes"), field:"comments", sortable:true, index:8, searchable:false, editor:Slick.Editors.Text, minWidth:290},
                {id:"link", name:jQuery("#translatedColumnNames").attr("data-action"), field:"link", cssClass:"cell-title", formatter:formatter, index:9, editor:Slick.Editors.Text, searchable:false, minWidth:180},
                {id:"isPrinted", name:jQuery("#translatedColumnNames").attr("data-printed"), field:"isPrinted", sortable:true, cssClass:"cell-title", index:10, formatter:Slick.Formatters.Checkmark, searchable:false, minWidth:80}
            ];
        }
    }
}



function formatter(row, cell, value, columnDef, dataContext) {
    return value;
}
