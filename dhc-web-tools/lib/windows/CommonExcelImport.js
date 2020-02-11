import message from '../message';

class CommonExcelImport {
    constructor(props) {
        this.param = props.params;
    }
    getTemplate() {
        return `
        <div id="com_item_excel_import" page_desc="EXCEL导入页面" model_name="sys" style="width:100%;height:100%"  >
        <div  class="easyui-layout"  id="layout1493257421488"   data-options='border:false,fit:true' >
            <div   data-options='border:true,split:true,region:"north",height:100' >
                <div id='group1493257678803' class='easyui-group' data-options='title:"EXCEL导入页面"'>
                    <div id="upfile_wrapper" class='field'>
                        <span class='field-label'>选择导入的文件</span>
                        <span >
                            <input  class="easyui-filebox" name="upfile"  data-options='type:"filebox",buttonText:"选择文件",buttonAlign:"right"'  id="upfile" />
                        </span>
                        <div id="upfile_tips" class='tips'></div>
                    </div>
                </div>
            </div>
            <div   data-options='layoutmanager:"1",border:true,width:200,split:true,region:"center"' >
                <div  id="excelDatagrid"  ></div>
            </div>
            <div  id="toolbar_1493257496419"  class="datagrid-toolbar"  style="height:26px"  >
                <a  class="easyui-buttons"  id="excelImport"   data-options='text:"Excel导入",repeat_click:true,iconCls:"icon-import",type:"ExcelImport"' ></a>
                <a  class="easyui-buttons"  id="saveBtn"   data-options='text:"保存",repeat_click:false,iconCls:"icon-man",type:"ToolItem"' ></a>
            </div>
        </div>
        </div>
        `;
    }
    init() {
        var excelColumns = this.param.columns;
        $('#excelDatagrid').datagrid({
            fitColumns: true,
            striped: true,
            fit: true,
            rownumbers: false,
            autoRowHeight: false,
            width: '300px',
            height: '300px',
            pagination: true,
            border: false,
            singleSelect: true,
            check: false,
            pageSize: 10,
            delayLoad: true,
            showFooter: true,
            multiSort: false,
            sendServerMeta: true,
            toolbar: '#toolbar_1493257496419',
            columns: excelColumns
        });
        var importMessage = null;
        $('#excelImport').click(function () {
            var fileDir = $('#upfile').filebox('getValue');
            var suffix = fileDir.substr(fileDir.lastIndexOf('.'));
            if ('' == fileDir) {
                message.warning('选择需要导入的Excel文件！');
                return false;
            }
            if ('.xls' != suffix && '.xlsx' != suffix && '.xlsm' != suffix) {
                message.warning('选择Excel格式的文件导入！');
                return false;
            }
            var export_columns = [];
            for (var i = 0; i < excelColumns[0].length; i++) {
                var temp = {};
                for (var j in excelColumns[0][i]) {
                    if (j == 'title' || j == 'field') {
                        temp[j] = excelColumns[0][i][j];
                    }
                }
                export_columns.push(temp);
            }
            var beanID = window.beanID;
            var tab_name = excelColumns[0][0]['tab_name'];
            $.ajaxFileUpload({
                url: '/zz/im/dhc/sys/controller/system/excel_template/CommonExcelController/importExcel',
                secureuri: false, //是否需要安全协议，一般设置为false
                fileElementId: ['upfile'], //文件上传域的ID
                dataType: 'json', //返回值类型 一般设置为json
                type: 'post',
                data: { beanID: beanID, tab_name: tab_name, import_columns: JSON.stringify(export_columns) },
                success(result)  //服务器成功响应处理函数
                {
                    importMessage = result.message;
                    var rows=JSON.parse(result.data);
                    $('#excelDatagrid').datagrid('loadData', { total: rows.length, rows: rows});
                    $('#upfile').filebox('clear');
                },
                error: function (data, status, e)//服务器响应失败处理函数
                {
                    message.error(e);
                }
            });
        });

        $('#saveBtn').click(function () {
            if (importMessage.length != 0) {
                message.info('保存提示', importMessage);
                //$.messager.alert('保存提示', importMessage);
                return;
            } else {
                //点击保存按钮后禁用导入
                var tab_name = excelColumns[0][0]['tab_name'];
                var excelData = $('#excelDatagrid').datagrid('getData');
                $.ajax({
                    url: '/im/dhc/sys/controller/system/excel_template/CommonExcelController/saveExcel',
                    type: 'POST', //GET
                    async: true,    //或false,是否异步
                    data: { excelData: JSON.stringify(excelData), tab_name: tab_name },
                    dataType: 'json',
                    cache: false,
                    success: function (validateMessage) {
                        message.success('导入提示', validateMessage.success);
                       
                    },
                    error: function (data, status, e)//服务器响应失败处理函数
                    {
                        message.error(e);
                    }
                });
            }

        });
    }

}
export default CommonExcelImport;
