'use strict'
angular.module('WDWeb').service('emailService', ['$localStorage', 'providerService', function ($localStorage, providerService) {
    var message = {
        desc: null,
        type: null
    };

    var attachOption = [{"display": "File", "value": "1"}, {"display": "Worldox Link", "value": "0"}];

    var emailTemplate = [
        {
            itemType: "group",
            items: [
                {
                    dataField: "To",
                    validationRules: [{
                        type: "required",
                        message: "To is required"
                    }]
                },
                {
                    dataField: "CC"
                },
                {
                    dataField: "BCC",
                    editorOptions: {
                        value: ""
                    }
                },
                {
                    dataField: "Subject",
                },
                {
                    dataField: "Body",
                    editorType: "dxTextArea",
                    editorOptions: {
                        height: 90
                    }
                },
                {
                    dataField: "Attach",
                    editorType: "dxSelectBox",
                    editorOptions: {
                        dataSource: attachOption,
                        valueExpr: "value",
                        displayExpr: "display"
                    },
                    validationRules: [{
                        type: "required",
                        message: "Attached type is required"
                    }]
                }
            ]
        }
    ];

    return {
      setMessage: setMessage,
      sendEmail: sendEmail,
      sendEmailService: sendEmailService
    }

    function setMessage(x, y) {
        message = {
            desc: x,
            type: y
        };
    }

    function sendEmail() {
        return emailTemplate;
    }

    function sendEmailService (x, y, z, e, i, n) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SENDMAIL+wd_SID=' + $localStorage.userData.session + '+Wd_List_RecNum=' + e + '+wd_List_ID=' + y.LID + '+wd_SEND_TO_VALUE=' + i.to + '+wd_SEND_CC_VALUE=' + i.cc + '+wd_SEND_BCC_VALUE=' + i.bcc + '+wd_SEND_BODYTEXT_VALUE=' + n + '+wd_SEND_SUBJECT_VALUE=' + x.Subject + '+wdAtt=' + z + '+wd_SEND_NAME_WDL_VALUE=' + x.wdlName + '+HTMLOnOk=/api/fileActions/fileStatus.json+HTMLOnFail=/api/fileActions/fileStatus.json'
        }
        return providerService.getResource(request);
    }
}]);
