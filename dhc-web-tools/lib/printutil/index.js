export default {
    // 绘画表格列表
    drawTable: function(groups, title) {
        var table1 = '<table border=1 cellSpacing=0 cellPadding=1 width="100%" style="border-collapse:collapse;font-size:15px" bordercolor="#333333"><tr height=23><td colspan="3" style="text-align:left;font-weight:bold"> ' + title + ' </td></tr>';
        for (let i = 0; i < groups.length; i++) {
            var tableId = groups[i].id;
            var allColumn = $('#' + tableId + '').datagrid('options').columns;
            for (let i = 0; i < allColumn[0].length; i++) {
                var arrayCol = allColumn[0];
                var groupArray = arrayCol[i];
                let html;
                if (i == allColumn[0].length - 1) {
                    html = this.initPrintTableTh(groupArray);
                    html += '</tr>';
                    table1 += html;
                } else if (i == 0) {
                    html = '<tr>';
                    html += this.initPrintTableTh(groupArray);
                    table1 += html;
                } else {
                    html = this.initPrintTableTh(groupArray);
                    table1 += html;
                }
            }
            var tabList = $('#' + tableId + '').datagrid('getRows');
            for (let i = 0; i < tabList.length; i++) {
                var html = '<tr>';
                let groupArray = tabList[i];
                html += this.initPrintTable(groupArray, allColumn[0]);
                html += '</tr>';
                table1 += html;
            }
        }
        table1 += '</table>';
        return table1;
    },


    // 打印表格
    initPrintTable: function(group, allColumns) {
        var table = '';
        for (var i = 0; i < allColumns.length; i++) {
            var key = allColumns[i].field;
            if (group[key + '_zh'] == undefined) {
                table += '<td width=140>&nbsp;&nbsp;' + group[key] + '</td>';
            } else {
                table += '<td width=140>&nbsp;&nbsp;' + group[key + '_zh'] + '</td>';
            }
        }
        return table;
    },
    // 获取表格列
    printHtml: function(html) {
        var s = window.screen.width;
        var LODOP = window.getLodop();
        LODOP.PRINT_INIT('打印控件');// 找不到
        LODOP.SET_PRINT_PAGESIZE(1, 0, 0, 'A4');
        LODOP.SET_PRINT_STYLE('FontSize', '15');
        if (s < 1500) {
            LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1);
            LODOP.ADD_PRINT_HTM(58, '5mm', '200mm', '90%', html);
        } else {
            LODOP.SET_PRINT_MODE('PRINT_PAGE_PERCENT', 'Width:64%');
            LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1);
            LODOP.ADD_PRINT_HTM(58, '1%', 'RightMargin:1%', '90%', html);
            LODOP.SET_PREVIEW_WINDOW(2, 2, 0, 0, 0, '');
        }
        LODOP.PREVIEW();
    },
    // 打印表格头
    initPrintTableTh: function (group) {
        var table = '<td width=280>&nbsp;&nbsp;' + group.title + '</td>';
        return table;
    },
    initPrintGroup: function (label, group) {
        var count = 0;
        var table = '';
        if (label != '') {
            table = '<tr style=\'font-weight:bold;\' height=23><td colspan=\'6\'>&nbsp;' + label + '</td></tr>';
        }

        for (let label in group) {
            if (count == 0) {
                table += '<tr height=23>';
            }
            table += '<td width=140>&nbsp;&nbsp;' + label + '</td><td width=160>&nbsp;&nbsp;' + group[label] + '</td>';
            count++;
            if (count == 3) {
                table += '</tr>';
                count = 0;
            }

        }
        if (count != 0) {
            for (; count <= 2; count++) {
                table += '<td width=140>&nbsp;</td><td width=160>&nbsp;</td>';
            }
            table += '</tr>';
        }
        return table;
    },
    /**
	 * 点击打印按钮调用此方法
	 */
    printLodop: function(opt) {
        var title = opt.title;
        var table = '<table border=1 cellSpacing=0 cellPadding=1 width="100%" style="border-collapse:collapse;font-size:15px" bordercolor="#333333"><tr height=23><td colspan=6 align="center"> '
            + title + ' </td></tr>';
        var groupArr = [];
        var titileArr = [];
        var groups = $('#form').children('.easyui-group');
        for (var i = 0; i < groups.length; i++) {
            var group = {};
            let title = $('#' + groups[i].id).children('div').first().text();
            titileArr.push(title);
            var divs = $('#' + groups[i].id).find('.field');
            for (var j = 0; j < divs.length; j++) {
                var label = $('#' + divs[j].id).text();
                // var input=$("#"+divs[j].id).find(".textbox-value");
                var input = $('.textbox-value', $('#' + divs[j].id));
                group[label] = input.val();


            }
            groupArr.push(group);

        }
        for (let i = 0; i < groupArr.length; i++) {
            var html = this.initPrintGroup(titileArr[i], groupArr[i]);
            table += html;
        }

        this.printHtml(table);
    }
}