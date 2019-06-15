(function () {
    var cabinetList = [];
    angular.module('WDWeb').factory('uxService', function($localStorage, $log, wdService) {

        var emailSubject,
            message = {
                desc: null,
                type: null
            };

        var loginData = [
            {
                itemType: "group",
                items: [
                    {
                        dataField: "Username",
                        label: {
                            visible: false
                        },
                        validationRules: [{
                            type: "required",
                            message: "Login is required"
                        }],
                        editorOptions: {
                            placeholder: 'Username'
                        }
                    },{
                        dataField: "Password",
                        editorOptions: {
                            mode: "password",
                            placeholder: 'Password'
                        },
                        label: {
                            visible: false
                        },
                        validationRules: [
                            {
                                type: "required",
                                message: "Password is required"
                            }
                        ]
                    }]
                }
        ];

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
                            items: ["File", "Worldox Link"],
                            value: ""
                        },
                        validationRules: [{
                            type: "required",
                            message: "Attached type is required"
                        }]
                    }
                ]
            }
        ];

        var checkInList = [
            { "display": "Replace over original", "id": "R" },
            { "display": "Add as new version", "id": "N" },
            { "display": "Revert back to original", "id": "D" }
        ]

        var chkinType = [
            {
                itemType: "group",
                items: [
                    {
                        dataField: "Action",
                        editorType: "dxSelectBox",
                        editorOptions: {
                            dataSource: checkInList,
                            value: 'id',
                            displayExpr: "display"
                        },
                        validationRules: [{
                            type: "required",
                            message: "Action is required"
                        }]
                    }
                ]
            }
        ];

        var version = [];
        var versionid = "";

        return {
            getloginData: getloginData,
            sendEmail: sendEmail,
            setSubject: setSubject,
            getAction: getAction,
            setMessage: setMessage,
            getMessage: getMessage,
            uploadFields: uploadFields,
            setVersion: setVersion,
            getVersion: getVersion,
            getVersionId: getVersionId
        }

        function getVersionId() {
            return versionid; 
        }

        function getVersion() {
           return version;
        }

        function setVersion(x) {
            if (x.Header !== undefined) {
                versionid = x.Header.List_ID;
                version = x.items;
            } else {
                versionid = "";
                version = [];
            }
        }

        function uploadFields(){
            return uploader;
        }

        function getAction() {
            return chkinType
        }

        function getloginData(x) {
            if (x == "Login") {
                return loginData
            } else {
                return emailReset
            }
        }

        function sendEmail() {
            return emailTemplate;
        }

        function setSubject(x) {
            // console.log(x);
            // emailSubject = x.toUpperCase();
            // return emailSubject;
        }

        function setMessage(x, y) {
            message = {
                desc: x,
                type: y
            };
        }

        function getMessage(){
            return message
        }

    });
})();
