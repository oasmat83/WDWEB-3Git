(function () {
    angular.module('WDWeb').service('wdService', ['$http', '$q', '$localStorage', '$rootScope', '$location', '$window', wdService]);

    function wdService($http, $q, $localStorage, $rootScope, $location, $window) {
        var fileData = {};
        
        return {
            fileList: fileList,
            download: download,
            view: view,
            checkout: checkout,
            checkIn: checkIn,
            chkToWorldox: chkToWorldox,
            showElements: showElements,
            viewData: viewData,
            getCabinetList: getCabinetList,
            testProfile: testProfile,
            newTestProfile:newTestProfile,
            uploadDoc: uploadDoc,
            getQuickProfile: getQuickProfile,
            getFavMatters: getFavMatters,
            fieldTables: fieldTables,
            navigaRoute:navigaRoute,
            logout: logout,
            chksession: chksession,
            dwnData: dwnData,
            getFolderLevel: getFolderLevel,
            getFieldDesc: getFieldDesc,
            clearList: clearList,
            getColumnID: getColumnID,
            newFile: newFile,
            getDirectCabinet: getDirectCabinet,
            uploadVerb: uploadVerb,
            uploadToWorldox: uploadToWorldox,
            setFields: setFields,
            getTemplate: getTemplate,
            wdlOpen: wdlOpen,
            cabinetData: cabinetData,
            checkProfile: checkProfile,
            getfieldTables: getfieldTables,
            setFileData: setFileData,
            getFileData: getFileData,
            getFieldDes: getFieldDes,
            getFieldDesTemp: getFieldDesTemp,
            getVersion: getVersion,
            updateProfile: updateProfile,
            clearNavList: clearNavList,
            clearListfromParm: clearListfromParm,
            addRemoveCat: addRemoveCat,
            updCategory: updCategory,
            deleteFile: deleteFile,
            addEditDelCategory: addEditDelCategory,
            setCats: setCats,
            setField: setField,
            getFileProfile: getFileProfile,
            setPgFields: setPgFields,
            getWdList: getWdList,
            fileToWdl: fileToWdl,
            setWdlName: setWdlName,
            setDub: setDub,
            isFileHasChanged:isFileHasChanged,
            lockFile:lockFile,
            unLockFile:unLockFile,
            getErrorMessage:getErrorMessage,
            checkAccessProfile: checkAccessProfile,
            setFileLock: setFileLock,
            updateWdl: updateWdl,
            downloadName: downloadName,
            getPgCabinets: getPgCabinets,
            setWdlDesc: setWdlDesc
        }

        function getPgCabinets () {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?CABINETS+wd_SID=' + $localStorage.userData.session + "+html=/api/cabinets/cabinets.json"
            }
            return $http(request);
        }

        function updateWdl(x, y){
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?FILEWDL+wd_SID=' + $localStorage.userData.session + '+wd_List_ID=' + x + '+wd_File_PathFile_Value=' + y + '+HTMLOnOK=/api/errorLog/error.json+HTMLOnFail=/api/errorLog/error.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            }
            return $http(request);
        }

        function setWdlDesc(n, x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+wd_List_RecNum=' + n + '+File_ELEMID=' + x + '+szFieldIn=' + y + '+wd_List_ID=' + z + '+HTMLOnOK=/api/fileActions/setField.json+HTMLOnFail=/api/fileActions/setField.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            }
            return $http(request);
        }

        function setPgFields(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?CABINETS+wd_SID=' + $localStorage.userData.session + '+wd_CABINET_ID_VALUE=' + x + '+HTMLOnOK=/api/cabinets/cabinets.json+HTMLOnFail=/api/cabinets/cabinets.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            }
            return $http(request);
        }

        function isFileHasChanged(){
            return $q(function(resolve, reject) {
                var infoData = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData().pop();
                return $http.get($localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+html=api/filelist/rereadRecord.json+wd_List_ID=' + infoData.LID + '+wd_List_RecNum=' + infoData.RN + '+wd_SID='+$localStorage.userData.session + '+skip=' + infoData.LN + '+take=1+wdUdUn=' +  Date.now())
                    .then(function (response) {
                        if(response.data.root.items == "" || infoData.HASH === response.data.root.items[0].HASH){
                            resolve({confirm: false, res: response.data.root, fileData: infoData});
                        }else{
                            resolve({confirm: true, res: response.data.root, fileData: infoData});
                        }
                    }, function (response) {
                        return $q.reject("Data Loading Error");
                    });
            });
        }

        function lockFile(){
            return $q(function(resolve, reject) {
                var infoData = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData().pop();
                $http.get($localStorage.host + 'cgi-bin/wdwebcgi.exe?LOCK+wd_SID='+$localStorage.userData.session+'+wd_List_ID=' + infoData.LID + '+wd_List_RecNum=' + infoData.RN + '+html=api/fileActions/lock.json')
                    .then(function (response) {
                        if(response.data.fileStatus.errorStatus.ErrorCount==""){
                            resolve({error: false, res: response});
                        }else{
                            resolve({error: true, res: response});
                        }
                    }, function (response) {
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
            });
        }

        function unLockFile(){
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?LOCK+wd_SID='+$localStorage.userData.session+'+wd_List_ID=' + $localStorage.wdListID + '+html=api/fileActions/lock.json',
            }
            return $http(request);
        }

        function getErrorMessage(error){
            $http.get($localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID='+$localStorage.userData.session+'+szVar='+ error+'+html=api/errorLog/getVar.json')
                .then(function (res) {
                    var infoData = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData().pop();
                    var objres = res.data.root.Dialog;
                    var titlePopup = objres[1];
                    $rootScope.$broadcast('showMessageLockError', {title:titlePopup, desc:infoData.Description, docid:infoData.DocId, content:objres });
                }, function (response) {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                });
        }

        function addEditDelCategory(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?CATMAKE+wd_SID=' + $localStorage.userData.session + '+Wd_File_Path_Value=' + encodeURIComponent(x.folderPth) + '+Wd_File_Cat_ID=' + x.action + '+Wd_File_Cat_Flag=' + x.selectedType + '+Wd_File_Cat_Name=' + x.name + '+Wd_File_Cat_Icon=' + x.icoPath + '+Wd_File_Cat_Del_Value=' + x.delFlag + '+html=/api/categories/makeCategories.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            }
            return $http(request);
        }

        function updCategory() {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/bookmarks.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            }
            return $http(request);
        }

        function addRemoveCat(x, y, z) {
            var addRemove = "";

            if (z) {
                addRemove = "+wd_FILE_CAT_DEL_VALUE=" + x.CN + "+"
            } else {
                addRemove = "+wd_FILE_CAT_ADD_VALUE=" + x.CN + "+"
            }

            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CATFILE+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ y.LID + '+Wd_List_RecNum=' + y.RN + addRemove + '+HTMLOnOK=/api/categories/addRemoveCategory.json+HTMLOnFail=/api/categories/addRemoveCategory.json+Offset=0+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now() + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function setFileLock(){
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?LOCK+wd_SID='+$localStorage.userData.session+'+wd_List_ID=' + $localStorage.wdListID + '+html=api/fileActions/lock.json',
            }
            return $http(request);
        }

        function setCats(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CATFILE+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ y.LID + '+Wd_List_RecNum=' + y.RN + x + '+HTMLOnOK=/api/categories/addRemoveCategory.json+HTMLOnFail=/api/categories/addRemoveCategory.json+Offset=' + y.LN + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            }
            return $http(request);
        }

        function updateProfile(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?RENAME+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ y.LID + '+Wd_List_RecNum=' + y.RN + '+Wd_Rename_Flags=' + x.wdRename + '+Wd_File_Field1_Value=' + x.field1.value + '+Wd_File_Field2_Value=' + x.field2.value + '+Wd_File_Field3_Value=' + x.field3.value + '+Wd_File_Field4_Value=' + x.field4.value + '+Wd_File_Field5_Value=' + x.field5.value + '+Wd_File_Field6_Value=' + x.field6.value + '+Wd_File_Field7_Value=' + x.field7.value + '+Wd_File_ProfileGroup_Value=' + x.cabinet + '+Wd_File_Xname_Value=' + x.desc + '+Wd_File_StatusFlags_Value=' + x.security + '+Wd_File_Comments_Value=' + x.comm + '+HTMLOnOK=/api/fileActions/fileStatus.json+HTMLOnFail=/api/fileActions/fileStatus.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function deleteFile(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?RENAME+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ x.LID + '+Wd_List_RecNum=' + x.RN + '+Wd_Rename_Flags=' + y + '+wd_file_xname_value=' + encodeURIComponent(x.Description) + '+HTMLOnOK=/api/fileActions/fileStatus.json+HTMLOnFail=/api/fileActions/fileStatus.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function setField(x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ x.LID + '+Wd_List_RecNum=' + x.RN + '+File_ELEMID=' + z + '+szFieldIn='+ y + '+HTMLOnOK=/api/fileActions/setField.json+HTMLOnFail=/api/fileActions/setField.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function setWdlName (xx, xy, xz, yx, yy) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+szData='+ xx.Description + '+wd_List_ID=' + xy.List_ID + '+File_ELEMID=' + yx + '+wd_List_RecNum='+ yy + '+nFlag=' + xz + '+HTMLOnOK=/api/fileActions/setField.json+HTMLOnFail=/api/fileActions/setField.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getFileProfile(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ x.LID + '+Wd_List_RecNum=' + x.RN + '+Offset=0+HTMLOnOK=/api/fileActions/getProfile.json+HTMLOnFail=/api/fileActions/getProfile.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getVersion(x) {
            var verId = $localStorage.columnId !== undefined ? $localStorage.columnId.version : "5376";
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?VERLIST+wd_SID=' + $localStorage.userData.session + '+wd_List_ID='+ x.LID + '+Wd_List_RecNum=' + x.RN + '+html=/api/filelist/fileList.json+skip=0+take=256+Wd_File_Sort_Key1=' + verId  + '+wd_File_Sort_Dir1=1+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getFieldDesTemp(x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/cabinets/getFields.json+HTMLOnFail=/api/cabinets/getFields.json+dwPGID=' + x + '+dwFieldNum=' + z + '+szFieldCode1=' + y.field10 + '+szFieldCode2=' + y.field11 + '+szFieldCode3=' + y.field12 + '+szFieldCode4=' + y.field13 + '+szFieldCode5=' + y.field14 + '+szFieldCode6=' + y.field15 + '+szFieldCode7=' + y.field16 + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getFieldDes(x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/cabinets/getFields.json+HTMLOnFail=/api/cabinets/getFields.json+dwPGID=' + x + '+dwFieldNum=' + z + '+szFieldCode1=' + y.field1 + '+szFieldCode2=' + y.field2 + '+szFieldCode3=' + y.field3 + '+szFieldCode4=' + y.field4 + '+szFieldCode5=' + y.field5 + '+szFieldCode6=' + y.field6 + '+szFieldCode7=' + y.field7 + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }


        function cabinetData(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/cabinets/folder-list.json+HTMLOnFail=/api/cabinets/folder-list.json+wd_BasePath=' + x + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function wdlOpen(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?OPENWDL+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fileList/wdlList.json+HTMLOnFail=/api/fileList/wdlList.json+Wd_File_Pathfile_Value=' + encodeURIComponent(x) + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getTemplate(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?FINDTEMPLATES+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/templates/searchList.json+HTMLOnFail=/api/templates/searchList.json+wd_LIST_FLAGS=' + x + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function setFields(x, y, z, n) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/fileActions/SetField.json+HTMLOnFail=/api/fileActions/SetField.json+wd_List_ID='+ n.LID + '+Wd_List_RecNum=' + n.RN + '+File_ELEMID=' + y + '+szFieldIn=' + x + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getDirectCabinet() {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/cabinets/subFolders.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function newFile (x, y) {
            var request;
            var userAgent = $window.navigator.userAgent;
            if (userAgent.indexOf('Frowser') != -1) {
                request = {
                    method: 'GET',
                    url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?NEWFILE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/fileActions/Newfile.json+HTMLOnFail=/api/fileActions/Newfile.json+wd_File_Field1_Value=' + x.field1.value +'+wd_File_Field2_Value=' + x.field2.value + '+wd_File_Field3_Value=' + x.field3.value + '+wd_File_Field4_Value=' + x.field4.value + '+wd_File_Field5_Value=' + x.field5.value + '+wd_File_Field6_Value=' + x.field6.value + '+wd_File_Field7_Value=' + x.field7.value + '+wd_File_ProfileGroup_Value=' + y.Cabinets.PGID + '+wd_file_xname_value=' + encodeURIComponent(y.Description) + '+wd_FILE_STATUSFLAGS_VALUE=' + y.Security + '+fileExt=' + y.SaveAs + '+wd_File_FileName_Value=[NewDoc].' + y.SaveAs + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
                }
            } else {
                request = {
                    method: 'GET',
                    url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?NEWFILE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/fileActions/Newfile.json+HTMLOnFail=/api/fileActions/Newfile.json+wd_File_Field1_Value=' + x.field1.value +'+wd_File_Field2_Value=' + x.field2.value + '+wd_File_Field3_Value=' + x.field3.value + '+wd_File_Field4_Value=' + x.field4.value + '+wd_File_Field5_Value=' + x.field5.value + '+wd_File_Field6_Value=' + x.field6.value + '+wd_File_Field7_Value=' + x.field7.value + '+wd_File_ProfileGroup_Value=' + y.Cabinets.PGID + '+wd_file_xname_value=' + encodeURIComponent(y.Description) + '+wd_FILE_STATUSFLAGS_VALUE=' + y.Security + '+fileExt=' + y.SaveAs + '+wd_File_FileName_Value=' + encodeURIComponent(y.Description) + '.' + y.SaveAs + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
                }
            }
            return $http(request);
        }

        function getColumnID () {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+HTML=/api/filelist/getFieldIds.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function clearList () {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CLOSELIST+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/list/closeList.json+HTMLOnFail=/api/list/closeList.json+wd_List_ID=' + $localStorage.wdListID + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function clearListfromParm (e) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CLOSELIST+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/list/closeList.json+HTMLOnFail=/api/list/closeList.json+wd_List_ID=' + e + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function clearNavList () {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CLOSELIST+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/list/closeList.json+HTMLOnFail=/api/list/closeList.json+wd_List_ID=' + $localStorage.wdNavlIst.wdlist + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getFieldDesc(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/testprofile/fieldDesc.json+dwPGID=' + x + '+dwParentRecNum=0+szFieldCode1=' + y.field1.value + '+szFieldCode2=' + y.field2.value +' ++szFieldCode3=' + y.field3.value + '+szFieldCode4=' + y.field4.value + '+szFieldCode5=' + y.field5.value + '+szFieldCode6=' + y.field6.value + '+szFieldCode7=' + y.field7.value + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getFolderLevel() {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/cabinets/uploadCabinet.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function dwnData(x) {
            var request = {
                method: 'POST',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    html: "/fileFunctions/apiList.json",
                    loc: x.data.FileLoc,
                    name: x.data.FileNme,
                    domain: x.data.Domain
                }
            }

            return $http(request);
        }

        function navigaRoute(x) {
            $location.path( x );
            $location.url($location.path());
        }

        function chksession() {
            // var chkDub = setDub();
            // console.log(chkDub);
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/authentication/authCheck.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function setDub() {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/index.html?wduser=' + $localStorage.userData.username.split("@")[0] + "&wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function logout() {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?LOGOFF+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/logoff/logoffSucc.json+HTMLOnFail=/logoff/logoffFail.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }


        function fieldTables(a,b,c,y,z,i,n) {
            var request = "",
            url = "",
            copy = angular.copy(b),
            valLength = n.length,
            filterValue = "";
            if (i) {
                if (valLength == 0) {
                    copy["field" + c].value = "";
                    filterValue = "+wd_List_Filter="
                } else {
                    copy["field" + c].value = "";
                    filterValue = "+wd_List_Filter=*" + n + "*";
                }
                url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+wd_FIELD1CODE_FILTER=' + copy.field1.value + '+wd_FIELD2CODE_FILTER=' + copy.field2.value + '+wd_FIELD3CODE_FILTER=' + copy.field3.value + '+wd_FIELD4CODE_FILTER=' + copy.field4.value + '+wd_FIELD5CODE_FILTER=' + copy.field5.value + '+wd_FIELD6CODE_FILTER=' + copy.field6.value + '+wd_FIELD7CODE_FILTER=' + copy.field7.value + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now() + filterValue;
                // url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+ID=11407+wd_FIELD1CODE_FILTER=' + copy.field1.value + '+wd_FIELD2CODE_FILTER=' + copy.field2.value + '+wd_FIELD3CODE_FILTER=' + copy.field3.value + '+wd_FIELD4CODE_FILTER=' + copy.field4.value + '+wd_FIELD5CODE_FILTER=' + copy.field5.value + '+wd_FIELD6CODE_FILTER=' + copy.field6.value + '+wd_FIELD7CODE_FILTER=' + copy.field7.value + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wd_FIELD1DESC_FILTER=' + copy.field1.value + '+wd_FIELD2DESC_FILTER=' + copy.field2.value + '+wd_FIELD3DESC_FILTER=' + copy.field3.value + '+wd_FIELD4DESC_FILTER=' + copy.field4.value + '+wd_FIELD5DESC_FILTER=' + copy.field5.value + '+wd_FIELD6DESC_FILTER=' + copy.field6.value + '+wd_FIELD7DESC_FILTER=' + copy.field7.value + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            } else {
                copy["field" + c].value = "";
                filterValue = "+wd_List_Filter="
                url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+wd_FIELD1CODE_FILTER=' + copy.field1.value + '+wd_FIELD2CODE_FILTER=' + copy.field2.value + '+wd_FIELD3CODE_FILTER=' + copy.field3.value + '+wd_FIELD4CODE_FILTER=' + copy.field4.value + '+wd_FIELD5CODE_FILTER=' + copy.field5.value + '+wd_FIELD6CODE_FILTER=' + copy.field6.value + '+wd_FIELD7CODE_FILTER=' + copy.field7.value + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now() + filterValue;
                // url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+ID=11407+wd_FIELD1CODE_FILTER=' + copy.field1.value + '+wd_FIELD2CODE_FILTER=' + copy.field2.value + '+wd_FIELD3CODE_FILTER=' + copy.field3.value + '+wd_FIELD4CODE_FILTER=' + copy.field4.value + '+wd_FIELD5CODE_FILTER=' + copy.field5.value + '+wd_FIELD6CODE_FILTER=' + copy.field6.value + '+wd_FIELD7CODE_FILTER=' + copy.field7.value + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }

            var request = {
                method: 'GET',
                url: url
            }
            return $http(request);
        }

        function getfieldTables(a,b,c,y,z,i,n) {
            var request = "",
            url = "",
            valLength = n.length;
            copy = angular.copy(b);
            filterValue = "";
            if (i) {
                if (valLength == 0) {
                    copy["field" + c] = "";
                    filterValue = "+wd_List_Filter="
                } else {
                    copy["field" + c] = "";
                    filterValue = "+wd_List_Filter=*" + n + "*";
                }
                url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+wd_FIELD1CODE_FILTER=' + copy.field1 + '+wd_FIELD2CODE_FILTER=' + copy.field2 + '+wd_FIELD3CODE_FILTER=' + copy.field3 + '+wd_FIELD4CODE_FILTER=' + copy.field4 + '+wd_FIELD5CODE_FILTER=' + copy.field5 + '+wd_FIELD6CODE_FILTER=' + copy.field6 + '+wd_FIELD7CODE_FILTER=' + copy.field7 + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now() + filterValue;
                //url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+ID=11407+wd_FIELD1CODE_FILTER=' + copy.field1 + '+wd_FIELD2CODE_FILTER=' + copy.field2 + '+wd_FIELD3CODE_FILTER=' + copy.field3 + '+wd_FIELD4CODE_FILTER=' + copy.field4 + '+wd_FIELD5CODE_FILTER=' + copy.field5 + '+wd_FIELD6CODE_FILTER=' + copy.field6 + '+wd_FIELD7CODE_FILTER=' + copy.field7 + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wd_FIELD1DESC_FILTER=' + copy.field1 + '+wd_FIELD2DESC_FILTER=' + copy.field2 + '+wd_FIELD3DESC_FILTER=' + copy.field3 + '+wd_FIELD4DESC_FILTER=' + copy.field4 + '+wd_FIELD5DESC_FILTER=' + copy.field5 + '+wd_FIELD6DESC_FILTER=' + copy.field6 + '+wd_FIELD7DESC_FILTER=' + copy.field7 + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now();
            } else {
                copy["field" + c] = "";
                filterValue = "+wd_List_Filter="
                url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+wd_FIELD1CODE_FILTER=' + copy.field1 + '+wd_FIELD2CODE_FILTER=' + copy.field2 + '+wd_FIELD3CODE_FILTER=' + copy.field3 + '+wd_FIELD4CODE_FILTER=' + copy.field4 + '+wd_FIELD5CODE_FILTER=' + copy.field5 + '+wd_FIELD6CODE_FILTER=' + copy.field6 + '+wd_FIELD7CODE_FILTER=' + copy.field7 + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now() + filterValue;
                //url = $localStorage.host + '/cgi-bin/wdwebcgi.exe?FIELDTABLE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOk=/api/fieldtables/fieldTables.json+HTMLOnFail=/api/fieldtables/fieldTables.json+wd_FIELD_PROFILEGROUP_FILTER=' + a + '+ID=11407+wd_FIELD1CODE_FILTER=' + copy.field1 + '+wd_FIELD2CODE_FILTER=' + copy.field2 + '+wd_FIELD3CODE_FILTER=' + copy.field3 + '+wd_FIELD4CODE_FILTER=' + copy.field4 + '+wd_FIELD5CODE_FILTER=' + copy.field5 + '+wd_FIELD6CODE_FILTER=' + copy.field6 + '+wd_FIELD7CODE_FILTER=' + copy.field7 + '+wd_FIELD_NUMBER_FILTER=' + c + '+maxCount=' + y + '+IndexFr=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now();
            }

            request = {
                method: 'GET',
                url: url
            }
            
            return $http(request);
        }

        function getFavMatters() {
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?Serve+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/favMatters.json+favId=upload+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function getQuickProfile(){
            var request = {
                method: 'GET',
                url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?Serve+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/quickprofiles.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function uploadDoc(x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?NEWFILE+wd_SID=' + $localStorage.userData.session + '+HtmlOnOK=/api/fileActions/Newfile.json+HtmlOnFail=/api/fileActions/Newfile.json+5350=' + x.Cabinets.PGID + '+ID=11405+wd_File_Field1_value=' + y.field1.value + '+wd_File_Field2_value=' + y.field2.value + '+wd_File_Field3_value=' + y.field3.value + '+wd_File_Field4_value=' + y.field4.value + '+wd_File_Field5_value=' + y.field5.value + '+wd_File_Field6_value=' + y.field6.value + '+wd_File_Field7_value=' + y.field7.value + "+wd_FILE_STATUSFLAGS_VALUE=" + x.Security + "+wd_FILE_FILENAME_VALUE=" + encodeURIComponent(z.name) + '+wd_file_xname_value=' + encodeURIComponent(x.Description) + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function uploadVerb(x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?UPLOAD+wd_SID=' + $localStorage.userData.session + '+HtmlOnOK=/api/fileActions/uploadVerb.json+HtmlOnFail=/api/fileActions/uploadVerb.json+Wd_List_RecNum=' + x.FileRN + '+wd_List_ID=' + x.FileLID + "+wd_FILE_STATUSFLAGS_VALUE=" + z.Security + "+wd_FILE_FILENAME_VALUE=" + encodeURIComponent(y[0].name) + "+wduser=" + $localStorage.userData.username.split('@')[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function testProfile(x, y){
            console.log(x);
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?TESTPROFILE+wd_SID=' + $localStorage.userData.session + '+wd_File_Field1_Value=' + y.field1.value + '+wd_File_Field2_Value=' + y.field2.value + '+wd_File_Field3_Value=' + y.field3.value + '+wd_File_Field4_Value=' + y.field4.value + '+wd_File_Field5_Value=' + y.field5.value + '+wd_File_Field6_Value=' + y.field6.value + '+wd_File_Field7_Value=' + y.field7.value + '+5350=' + x.Cabinets.split("|")[0] + '+HTMLOnOK=/api/testprofile/test-profile.json+HTMLOnFail=/api/testprofile/test-profile.json+ID=10407+wd_File_Path_Filter=SAVE'
            }
            return $http(request);
        }

        function newTestProfile(x, y){
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?TESTPROFILE+wd_SID=' + $localStorage.userData.session + '+wd_File_Field1_Value=' + y.field1.value + '+wd_File_Field2_Value=' + y.field2.value + '+wd_File_Field3_Value=' + y.field3.value + '+wd_File_Field4_Value=' + y.field4.value + '+wd_File_Field5_Value=' + y.field5.value + '+wd_File_Field6_Value=' + y.field6.value + '+wd_File_Field7_Value=' + y.field7.value + '+5350=' + x.Cabinets.PGID + '+HTMLOnOK=/api/testprofile/test-profile.json+HTMLOnFail=/api/testprofile/test-profile.json+ID=10407+wd_File_Path_Filter=SAVE'
            }
            return $http(request);
        }

        function checkProfile(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?TESTPROFILE+wd_SID=' + $localStorage.userData.session + '+wd_File_Field1_Value=' + y.field1 + '+wd_File_Field2_Value=' + y.field2 + '+wd_File_Field3_Value=' + y.field3 + '+wd_File_Field4_Value=' + y.field4 + '+wd_File_Field5_Value=' + y.field5 + '+wd_File_Field6_Value=' + y.field6 + '+wd_File_Field7_Value=' + y.field7 + '+5350=' + x.Cabinets.split("|")[0] + '+HTMLOnOK=/api/testprofile/test-profile.json+HTMLOnFail=/api/testprofile/test-profile.json+ID=10407+wd_File_Path_Filter=SAVE'
            }
            return $http(request);
        }

        function checkAccessProfile(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?TESTPROFILE+wd_SID=' + $localStorage.userData.session + '+wd_File_Field1_Value=' + y.field1 + '+wd_File_Field2_Value=' + y.field2 + '+wd_File_Field3_Value=' + y.field3 + '+wd_File_Field4_Value=' + y.field4 + '+wd_File_Field5_Value=' + y.field5 + '+wd_File_Field6_Value=' + y.field6 + '+wd_File_Field7_Value=' + y.field7 + '+5350=' + x.Cabinets.split("|")[0] + '+HTMLOnOK=/api/testprofile/test-profile.json+HTMLOnFail=/api/testprofile/test-profile.json+ID=10407+wd_File_Path_Filter=PATH'
            }
            return $http(request);
        }

        function getCabinetList() {
            var request = {
                method: "GET",
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/cabinets/uploadCabinet.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function viewData(x) {
            var request = {
                method: "GET",
                url: "./home?query=" + x
            }
            return $http(request);
        }

        function showElements(obj) {
            this.showNav = obj.showNav;
            $rootScope.$broadcast('navEvent', obj)
        }


        function chkToWorldox(y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CHECKIN+wd_SID=' + $localStorage.userData.session + '+Wd_List_RecNum=' + y.RN + '+wd_List_ID=' + y.LID + '+wd_File_FileName_Value=' + z + '+HTMLOnOK=/api/fileActions/fileStatus.json+HTMLOnFail=/api/fileActions/fileStatus.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function uploadToWorldox(x, y, z) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?UPLOAD+wd_SID=' + $localStorage.userData.session + '+Wd_List_RecNum=' + y.RN + '+wd_List_ID=' + y.LID + '+wd_File_FileName_Value=' + z + '+wd_FILE_VERSION_VALUE=' + x + '+HtmlOnOK=/api/fileActions/uploadVerb.json+HtmlOnFail=/api/fileActions/uploadVerb.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function checkIn(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CHECKIN+wd_SID='  + $localStorage.userData.session + '+Wd_List_RecNum=' + x.RN + '+wd_List_ID=' + x.LID + '+HTMLOnOK=/api/fileActions/fileStatus.json+HTMLOnFail=/api/fileActions/fileStatus.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function checkout(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CHECKOUT+wd_SID='  + $localStorage.userData.session + '+Wd_List_RecNum=' + x.RN + '+wd_List_ID=' + x.LID + '+HTMLOnOK=/api/fileActions/fileStatus.json+HTMLOnFail=/api/fileActions/fileStatus.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function download(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host +  'cgi-bin/wdwebcgi.exe?DOWNLOAD+wd_SID=' + $localStorage.userData.session + '+html=api/fileActions/download.json+wd_List_RecNum=' + x.RN + '+wd_List_ID=' + x.LID + '+wd_List_Offset=' + x.LN + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }

            return $http(request);
        }

        function downloadName(x) {
            var request = {
                method: 'GET',
                url: $localStorage.host +  'cgi-bin/wdwebcgi.exe?DOWNLOAD+wd_SID=' + $localStorage.userData.session + '+html=api/fileActions/download-short.json+wd_List_RecNum=' + x.RN + '+wd_List_ID=' + x.LID + '+wd_List_Offset=' + x.LN + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }

            return $http(request);
        }



        function view(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+Html=/fileFunctions/viewer.html+wd_List_ID=' + x.LID + '+wd_List_RecNum=' + x.RN + '+wd_List_Offset=' + x.LN + '+PageNum=' + y + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function fileList(query, x, y) {

            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?FINDFILES+wd_SID=' + $localStorage.userData.session + '+html=/api/filelist/fileList.json+wd_FIND_QUERY=?D ' + query + '+skip=' + x + '+take=' + y + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);

        }

        function getWdList(x, y, z) {

            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?FINDFILES+wd_SID=' + $localStorage.userData.session + '+html=/api/filelist/fileList.json+wd_FIND_QUERY=Project: ' + x + '+skip=' + y + '+take=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);

        }

        function fileToWdl(x, y) {
            var request = {
                method: 'GET',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?FILEWDL+wd_SID=' + $localStorage.userData.session + '+html=/api/fileActions/fileStatus.json+wd_List_ID=' + y + '+wd_File_PathFile_Value=' + x + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
            }
            return $http(request);
        }

        function setFileData (x) {
            if (x != "") {
                fileData = x;
                return false;
            }
            fileData = [];
        }

        function getFileData () {
            return fileData;
        }
    }

})();
