/**
 * @author mr
 * @abstract 页面js文件
 */
$(function () {
    var test = SelectInput({
        ele: '#test',
        data: ['张三', '张四', '张五', '张六', '张七',
               '李三', '李四', '李五', '李六', '李七',
               '王三', '王四', '王五', '王六', '王七',
               '钱三', '钱四', '钱五', '钱六', '钱七'
              ],
        select: [1, 4, 7]
    });
    var testTwo = SelectInput({
        ele: '#testTwo',
        data: ['哈哈', '呵呵', '马超', '赵云', '黄忠',
               '李白', '杜甫', '王安石', '王维', '苏轼',
               '刘备', '曹操', '孙权']
    });
    //test
    //setInterval(function () {
    //    //重新设置数据，默认会删除已选择数据，如需保留，设置第二个参数为true
    //    //test.setData(['哈哈']);
    //    console.log(test.getSelects());
    //},5000);
});

/**
 * @author mr
 * @abstract 传入jQuery对象，生成相应功能组件
 */
(function ($, window) {
    window.SelectInput = function (options) {
        var SI = this;
        SI.count = SI.count ? SI.count + 1 : 1;
        var result = {};
        var outInterface = {};
        //必须传入正确ele，否则输出错误信息并返回
        if(!options.ele && $(options.ele).length == 0){
            console.log('未找到相应元素。');
            return
        }
        result.rootEle = $(options.ele).addClass('clearfix').css({
            border: 'solid 1px #bbbbbb',
            'padding': '5px'
        }).click(function () {
            result.inputArea.focus();
        });
        result.allData = options.data ? options.data : [];
        result.selectData = [];
        //选择结果区域
        result.selectArea = $('<span></span>');
        //输入区域
        result.inputArea = $('<input>').css({
            border: 'none',
            outline: 'none',
            padding: '0 10px',
            height: '32px'
        });
        //筛选区域
        result.suggestArea = $('<div></div>').css({
            display: 'none',
            border: 'solid 1px #bbbbbb'
        });
        //错误显示区域
        result.errorArea = $('<div class="si-error text-danger text-right"></div>');
        //全选按钮
        result.allBtn = $('<button class="btn btn-xs btn-default pull-right si-all-btn">+</button>');
        //添加选择数据
        result.addSelect = function (element, show) {
            if(show || show === ''){
                result.inputArea.val(show);
            }
            result.errorArea.css('display', 'none');
            if(result.selectData.indexOf(element.attr('data-index')) >= 0){

            }else {
                result.selectData.push(element.attr('data-index'));
                result.allModalSelect.append(element.clone().removeClass('active'));
                result.selectArea.append(element.clone().addClass('pull-left label label-primary label-select').removeClass('active hover-gray'));
            }
        };
        //删除选择数据
        result.delSelect = function (element) {
            if(result.selectData.indexOf(element.attr('data-index')) >= 0){
                var start = result.selectData.indexOf(element.attr('data-index'));
                result.selectData.splice(start, 1);
                result.selectArea.children('[data-index = "'+element.attr('data-index')+'"]').remove();
                result.allModalSelect.children('[data-index = "'+element.attr('data-index')+'"]').remove();
            }
        };
        //处理数据加索引
        result.transData = function (datas) {
            var tempInput = $("<input>");
            for(var i in datas){
                if(typeof datas[i] != "object"){
                    datas[i] = {
                        index: i,
                        text: datas[i],
                        py: tempInput.val(datas[i]).toPinyin().toLowerCase().replace(/ /,'')
                    };
                }else {
                    datas[i].index = i;
                    datas[i].py = tempInput.val(datas[i]).toPinyin().toLowerCase().replace(/ /,'');
                }
            }
        };
        result.transData(result.allData);
        //填充数据
        result.fillData = function (ele, datas) {
            ele.empty();
            for(var i in datas){
                ele.append($('<div class="hover-gray si-li" data-index="'+datas[i].index+'">'+datas[i].text+'</div>'));
            }
        };
        //验证数据
        result.validate = function (arr) {
            var words = arr;
            var vali = {
                status: true,
                arr: [],
                errors: []
            };
            for(var i = 0; i < words.length; i++){
                var word = $.trim(words[i]);
                for(var index in result.allData){
                    if(result.allData[index].text == word){
                        vali.arr.push(result.allData[index].index);
                        break
                    }else if(result.allData.length - 1 == index) {
                        vali.status = false;
                        vali.errors.push(word);
                    }
                }
            }
            return vali
        };
        //设置suggest数据
        result.setSuggestData = function (data) {
            if(data.length > 0){
                result.fillData(result.suggestArea.css('display', 'block'), data);
            }else {
                result.suggestArea.css('display', 'none');
            }
        };
        //全选区域模态框
        var modal = $('#SI_modal' + SI.count);
        if(modal.length > 0){
            result.allModal = modal;
        }else {
            //创建模态框
            var modalStr = '<div id="SI_modal_' + SI.count + '" class="modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-body clearfix"></div></div></div></div>';
            result.allModal = $(modalStr);
            result.allModal.find('.modal-body').append($('<div class="col-xs-5 all-data"></div><div class="col-xs-2 all-options"></div><div class="col-xs-5 select-data"></div>'));
            result.allModalData = result.allModal.find('.all-data');
            result.allModalSelect = result.allModal.find('.select-data');
            result.allModalOptions = result.allModal.find('.all-options');
            //模态框操作
            var addBtn = $('<button class="btn btn-xs btn-success col-xs-12">添加</button>');
            var delBtn = $('<button class="btn btn-xs btn-warning col-xs-12">删除</button>');
            var allAdd = $('<button class="btn btn-xs btn-primary col-xs-12">全加</button>');
            var allDel = $('<button class="btn btn-xs btn-danger col-xs-12">全删</button>');
            addBtn.click(function () {
                result.allModalData.children('.active').each(function (index, element) {
                    result.addSelect($(element));
                });
            });
            delBtn.click(function () {
                result.allModalSelect.children('.active').each(function (index, element) {
                    result.delSelect($(element));
                });
            });
            allAdd.click(function () {
                result.allModalData.children('div').each(function (index, element) {
                    result.addSelect($(element));
                });
            });
            allDel.click(function () {
                result.allModalSelect.children('div').each(function (index, element) {
                    result.delSelect($(element));
                });
            });
            result.allModalOptions.append(addBtn).append(delBtn).append(allAdd).append(allDel);
            var shiftSelect = function (ele, now, type) {
                return function () {
                    var target = $(event.target);
                    var done = ele.children('.active');
                    var start;
                    var end;
                    if(event.shiftKey && done.length > 0){
                        if(done.index() > target.index()){
                            start = target.index();
                            end = done.index();
                        }else {
                            start = done.index();
                            end = target.index();
                        }
                        result.allModalData.children('div').removeClass('active');
                        result.allModalSelect.children('div').removeClass('active');
                        for(var i = start; i <= end; i++){
                            ele.children('div').eq(i).addClass('active');
                        }
                    }else {
                        result.allModalData.children('div').removeClass('active');
                        result.allModalSelect.children('div').removeClass('active');
                        target.addClass('active');
                    }
                    //表示立即执行操作
                    if(now){
                        if(type){
                            addBtn.click();
                            result.allModal.show();
                        }else {
                            delBtn.click();
                            result.allModal.show();
                        }
                    }
                }
            };
            result.allModalData.on('click', 'div', shiftSelect(result.allModalData));
            result.allModalData.on('dblclick', 'div', shiftSelect(result.allModalData, true, 1));
            result.allModalSelect.on('click', 'div', shiftSelect(result.allModalSelect));
            result.allModalSelect.on('dblclick', 'div', shiftSelect(result.allModalSelect, true, 0));
            $('body').append(result.allModal).click(function () {
                result.allModal.hide();
            });
        }
        result.allBtn.click(function () {
            result.allModal.show();
            event.stopPropagation();
        });
        result.allModal.find('.modal-dialog').click(function () {
            event.stopPropagation();
        });
        //result.allModal.find('.modal-dialog').dblclick(function () {
        //    event.stopPropagation();
        //});
        //布局dom
        result.rootEle.before(result.errorArea).after(result.suggestArea).append(result.selectArea)
            .append(result.inputArea).append(result.allBtn);
        result.fillData(result.allModalData, result.allData);
        if(options.select && typeof options.select == 'object'){
            for(var i in options.select){
                result.addSelect(result.allModalData.children('div').eq(options.select[i]));
            }
        }
        result.inputArea.keydown(function () {
            if(event.keyCode == 8 && $(this).val() == ''){
                result.delSelect(result.allModalSelect.children('div').last());
            }
        });
        result.inputArea.keyup(function () {
            console.log($(this).val());
            var arr = [];
            var vali;
            var q = '';
            if($.trim($(this).val()) != ''){
                arr = $(this).val().split(/,|，/);
            }
            if(event.keyCode == 13){
                vali = result.validate(arr);
                for(var i = 0; i < vali.arr.length; i++){
                    result.addSelect(result.allModalData.children('div').eq(vali.arr[i]), $(this).val().replace(new RegExp(result.allData[vali.arr[i]].text+"(,|，)*"), ''));
                }
                if(vali.errors.length > 0){
                    result.errorArea.html(vali.errors.join('、') + '不存在').css('display', 'block');
                    q = vali.errors[vali.errors.length - 1];
                }else {
                    result.errorArea.css('diaplay', 'none');
                }
            }else {
                q = arr[arr.length - 1];
            }
            if($.trim(q) == ''){
                result.suggestArea.css('display', 'none');
                return
            }
            var filter = [];
            for(var j in result.allData){
                var oriCheck = result.allData[j].text.indexOf(q);
                var pyCheck = true;
                var pyArray = q.split('');
                for(var i = 0; i < pyArray.length; i++){
                    if(result.allData[j].py.indexOf(pyArray[i].toLowerCase()) < 0){
                        pyCheck = false;
                    }
                }
                if(oriCheck >= 0 || pyCheck){
                    filter.push(result.allData[j]);
                }
            }
            result.setSuggestData(filter);
        });
        result.suggestArea.on('click', 'div', function () {
            result.addSelect(result.allModalData.children('div').eq($(event.target).attr('data-index')));
        });
        result.selectArea.on('click', '.label', function () {
            var index = result.selectData.indexOf($(event.target).attr('data-index'));
            result.delSelect(result.allModalSelect.children('div').eq(index));
        });
        outInterface.getSelects = function () {
            var array = [];
            for(var i = 0; i < result.selectData.length; i++){
                array.push(result.allData[result.selectData[i]]);
            }
            return array
        };
        outInterface.setData = function (datas, clear) {
            result.allData = datas;
            result.transData(result.allData);
            result.fillData(result.allModalData, result.allData);
            if(!clear){
                result.allModalSelect.children('div').each(function (index, element) {
                    result.delSelect($(element));
                });
            }
        };
        //返回需要暴露的接口
        return outInterface
    }
})(jQuery, window);
