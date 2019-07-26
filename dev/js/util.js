//搜索mo  连带User
function searchMo(condition, exportFlag) {
  $.ajax('/FHR/Mo.do?m=getMoList', {
    'type': 'post',
    'data': condition,
    success: function (res) {
      if (res.msg == "查询成功") {
        var mos = res.mos;
        var allSize = res.allSize;
        user = res.uid;
        mosArr = mos;
        for (var i = 0, len = mosArr.length; i < len; i++) {
          var emps = mosArr[i].moEmployees;
          var validEmps = [];
          for (var j in emps) {
            if (emps[j].validFlag == "1") {
              validEmps.push(emps[j]);
            }
          }
          mosArr[i].moEmployees = validEmps;
        }
        if (exportFlag) {
          exportMos(mos);
        } else {
          buildMainPage(mos);
          //pageControll
          pageControll(allSize);
        }
      }
    },
    error: function () {}
  })
}
//查询管理员
function getMoManager(){
  var data = null;
  $.ajax('/FHR/Mo.do?m=getMoManager',{
    'type':'post',
    success:function(res){
      var json = JSON.parse(res);
      moManager = json.moManager;
    },
    error:function(){
      console.log(arguments)
    }
  })
  return data;
}

//导出mo
function exportMos(mos) {
  var mosLen = mos.length
  for (var i = 0; i < mosLen; i++) {
    var aMoEmployees = mos[i].moEmployees;
    var aMoEmployeesLen = aMoEmployees.length;
    var employeeArr = [];
    for (var j = 0; j < aMoEmployeesLen; j++) {
      var aEmp = returnOperationName(aMoEmployees[j].operation) + '-' + aMoEmployees[j].employeeName + '-' + aMoEmployees[j].employeeNumber + '<br>'
      employeeArr.push(aEmp)
    }
    mos[i].moEmployees = employeeArr;
  }
  var title = ['id', 'Mo人员', '发生日期', '厂别', '机种', 'mo类型', '是否复训', '主状态', '异常类型', '管理员', '作业数', '不良数', '维护人员', '复训情况', '备注'];
  var filter = ['dateOfCreate', 'dateOfUpdate', 'updater', 'isValid'];
  JSONToExcelConvertor(mos, 'Mo导出', title, filter);
}

//通过operationID 返回 operation Name
function returnOperationName(operationID) {
  var operations = allOperation.All;
  var allOperationLen = operations.length;
  for (var i = 0; i < allOperationLen; i++) {
    if (operationID == operations[i].oid) {
      return operations[i].oname;
    }
  }
}

//主页显示
function buildMainPage(mos) {
  $('.body').empty();
  var moLen = mos.length;
  for (var i = 0; i < moLen; i++) {
    var oMo = mos[i];
    var moItem = '<div class="listRow" data-id="' + oMo.id + '">\
    <div class="date item first">' + oMo.happenDate + '</div>\
    <div class="scope item">' + oMo.scope_FK + '</div>\
    <div class="machineKind item">' + oMo.machine_FK + '</div>\
    <div class="moType item">' + (oMo.moLevel == 1 ? '<div class="red">重大MO</div>' : '<div class="orange">一般事项</div>') + '</div>\
    <div class="mainType item">' + oMo.mainState + '</div>\
    <div class="exceptionTypes item">' + oMo.exceptionType + '</div>\
    <div class="operationGroup item">\
      <span class="operationCount">' + getOperationCount(oMo.moEmployees).count + '</span>\
      <span>个</span>\
      <img src="./moDist/img/triangle.png" alt="下拉">\
    </div>\
    <div class="employee item">\
      <span class="employeeCount">' + oMo.moEmployees.length + '</span>\
      <span>人</span>\
      <img src="./moDist/img/triangle.png" alt="下拉">\
    </div>\
    <div class="trainingResult item">' + getTrainingResultName(oMo.trainingResult) + '</div>\
  </div>'
    moItem = $(moItem);
    $('.body').append(moItem);
  }
  // 每行 双击 显示详情。
  $('.listRow').dblclick(function () {
    showOrEdit($(this)[0].dataset.id, mosArr)
  })
}
//getTrainingResultName
function getTrainingResultName(trainingResultId) {
  if (trainingResultId == 1) {
    return '<div class="red">需要复训</div>';
  } else if (trainingResultId == -1) {
    return '<div class="blue">无需复训</div>';
  } else if (trainingResultId == 0) {
    return '<div class="green">复训完成</div>';
  } else {
    alert("复训结果出错")
  }
}

// 双击一条显示详情，如果 creator 相同 则可以保存修改 或 删除。
function showOrEdit(id, mosArr) {
  var data;
  for (var i in mosArr) {
    if (mosArr[i].id === parseInt(id)) {
      data = mosArr[i];
      break;
    }
  }
  showBase();
  fillData(data);
}

function showBase() {
  var ele = '\
		<div class="bg">\
			<div class="title">MO详情</div>\
			<div class="closeBtn">\
				<img src="./moDist/img/close.png" alt="关闭">\
			</div>\
			<div class="info">\
				<div class="baseInfo">\
						<label for="happenDate">发生日期:</label>\
						<div class="input-group date form_date" data-date-format="yyyy/mm/dd" >\
							<input class="form-control" id="happenDate" name="happenDate" type="text" readonly >\
							<span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span>\
							<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>\
						</div>\
						<label for="insertScope">厂别:</label>\
            <select name="insertScope" id="insertScope" class="form-control scope">\
              <option value="" selected></option>\
							<option value="M1">M1</option>\
							<option value="M2">M2</option>\
						</select>\
						<label for="insertMachineKind">机种:</label>\
						<select name="insertMachineKind" id="insertMachineKind" class="form-control machineKind">\
						</select>\
						<label for="insertMoKind">MO类型:</label>\
						<select name="insertMoKind" id="insertMoKind" class="form-control moKind">\
							<option value="0">一般事项</option>\
							<option value="1">重大MO</option>\
						</select>\
						<label for="insertTrainingAgain">复训:</label>\
						<select name="insertTrainingAgain" id="insertTrainingAgain" class="form-control trainingAgain">\
							<option value="1">是</option>\
							<option value="0">否</option>\
						</select>\
						<label for="insertManagePerson">管理员</label>\
						<select name="insertManagePerson" id="insertManagePerson" class="form-control managePerson last">\
						</select>\
						<label for="insertMainState">主状态:</label>\
					<select name="insertMainState" id="insertMainState" class="form-control mainState">\
						<option value="外观">外观</option>\
						<option value="画质">画质</option>\
						<option value="Function">Function</option>\
					</select>\
					<label for="insertExceptionTypes">异常类型:</label>\
					<input type="text" class="form-control exceptionTypes" id="insertExceptionTypes" name="insertExceptionTypes">\
					<label for="productCount">作业数</label>\
					<input type="text" placeholder="数字" id="productCount" class="form-control productCount" name="porductCount" id="productCount">\
					<label for="badCount">不良数</label>\
					<input type="text" placeholder="数字" class="form-control badCount" id="badCount">\
					<label for="badRate">不良率</label>\
					<input type="text" readonly class="form-control badRate">\
				</div>\
				<form class="employeeInfo">\
				</form>\
				<label for="memo">备注:</label>\
				<div class="memo" id="memo" contenteditable="true">\
				</div>\
      </div>\
      <div class="bottomButton">\
					<div class="delete">删除</div>\
					<div class="submit">修改</div>\
      </div>\
		</div>';
  $('.insertMo').html(ele);
  $('.insertMo').css({
    'display': 'block'
  })

  buildCalendar('form_date');
  fillSelect(machineKinkArr, '#insertMachineKind');
  $(".closeBtn").click(() => {
    $('.insertMo').css({
      'display': 'none'
    }).empty();
  })
  fillSelect(moManager,'#insertManagePerson');

  $('.badCount').blur(function () {
    if ($(this).val()) {
      if (isNaN($(this).val())) {
        $(this).val("");
        alert("请输入数字类型");
        return
      }
      if (isNaN($('.productCount').val())) {
        $('.badRate').val('');
      } else {
        $('.badRate').focus();
      }
    } else {
      return
    }
  })
  $('.productCount').blur(function () {
    if ($(this).val()) {
      if (isNaN($(this).val())) {
        $(this).val("");
        alert("请输入数字类型");
        return;
      }
      if (isNaN($('.badCount').val())) {
        $('.badRate').val('');
      } else {
        $('.badRate').focus();
      }
    } else {
      return
    }
  });

  $('.badRate').focus(function () {
    if ($('.badCount').val() && $('.productCount').val()) {
      $(this).val(($('.badCount').val() / $('.productCount').val()).toFixed(3));
    }
  })

}
//为模态框填充信息
function fillData(data) {
  //如果不是本人登录隐藏修改按钮
  if (data.creator !== user) {
    $('.bottomButton').css({
      'display': 'none'
    })
  }
  $('#happenDate').val(data.happenDate);
  selectSelected('#insertMachineKind', data.machine_FK);
  selectSelected('#insertMoKind', data.moLevel);
  selectSelected('#insertTrainingAgain', data.trainingAgain);
  selectSelected('#insertManagePerson', data.managePerson);
  selectSelected('#insertMainState', data.mainState);
  $('#insertExceptionTypes').val(data.exceptionType);
  $('#productCount').val(data.productCount);
  $('#badCount').val(data.badCount);
  $('#memo').html(data.memo);
  var empArr = data.moEmployees;
  var opEmArr = parseEmployeeOperation(empArr);
  var scope = data.scope_FK;
  //厂别变换
  $('#insertScope').change(function () {
    var operationCount = 1;
    var operationArray = allOperation[$(this).val()];
    //插入 operation 组
    insertOperationGroup(operationCount, operationArray, 'init');
  })
  selectSelected('#insertScope', scope);
  $('#insertScope').change();
  //触发事件  达到还原 人员 数据效果
  triggerEvent(opEmArr); //数据还原后
  //chosen 插件
  // $('.addEmployee').chosen({no_results_text:'输入有错!'});
  $('.addEmployee').click(function(){
    $(this).chosen({no_results_text:'输入有错!'});
  })  
  var insertSelectArray = [
    '#happenDate',
    '#insertScope',
    '#insertMachineKind',
    '#insertMoKind',
    '#insertTrainingAgain',
    '#insertManagePerson',
    '#insertMainState',
    '#insertExceptionTypes',
    '#productCount',
    '#badCount', '#memo'
  ];
  addChangeValueToJson(insertSelectArray, insertOption);


  //还原 人员选择后  执行  修改  删除操作。
  var submitFlag = true;
  $('.submit').click(function () {
    if (submitFlag) {
      submitFlag = false;
      setTimeout(() => {
        submitFlag = true;
      }, 1000);
      //获取 employee
      var employeeArr = getNoRepeatEmployees();
      //判断是否 选择人员
      if (employeeArr.length === 0) {
        alert("请选择人员");
        return
      }
      //判断基础添加是否填写全
      for (var item in insertOption) {
        var s = insertOption[item];
        if (s == "") {
          $('#' + item)[0].focus();
          addAnimate('#' + item, 'bounce')
          return
        }
      }
      //获取参数 修改
      var employeeArr = getNoRepeatEmployees();
      $.ajax('/FHR/Mo.do?m=updateMo', {
        type: 'POST',
        data: {
          msg: 'update',
          id: data.id,
          insertOption: JSON.stringify(insertOption),
          employeeArr: JSON.stringify(employeeArr)
        },
        success: function (res) {
          if (res.code === '0') {
            alert('修改成功');
            insertOption = {};
            $('.insertMo').empty().css({
              'display': 'none'
            });
          } else {
            alert('修改失败');
          }
        }
      })
    } else {
      return
    }
  })
  var deleteFlag = true;
  $('.delete').click(function () {
    if (deleteFlag) {
      deleteFlag = false;
      setTimeout(() => {
        deleteFlag = true;
      }, 1000);
      $.ajax('/FHR/Mo.do?m=deleteMo', {
        type: 'POST',
        data: {
          msg: 'delete',
          id: data.id
        },
        success: function (res) {
          if (res.code === '0') {
            alert('删除成功');
            insertOption = {};
            $('.insertMo').empty().css({
              'display': 'none'
            });
          } else {
            alert('删除失败');
          }
        }
      })
    } else {
      return;
    }
  })
}
//触发事件  达到还原数据效果
function triggerEvent(opEmArr) {
  var operationCount = 1;
  var employeeGroupCount = 1;
  var opEmArrLen = opEmArr.length;
  var objLen = 0;
  for (var item in opEmArr) {
    objLen++;
    if (item == 'length') {
      continue;
    }
    var aOperationClass = '.operation_' + operationCount;
    var aOperationEmployeeArr = opEmArr[item];
    selectSelected(aOperationClass, item);
    $(aOperationClass).change();
    var employeeCount = 1;
    var aOEArrLen = aOperationEmployeeArr.length
    for (var i = 0; i < aOEArrLen; i++) {
      (function (j) {
        var aEmployeeGroup = '.employeeGroup_' + employeeGroupCount;
        var aemployeeNumber = aOperationEmployeeArr[j];
        selectSelected(aEmployeeGroup + ' .addEmployee_' + operationCount + '_' + employeeCount, aemployeeNumber)
        if (aOEArrLen !== j + 1) {
          $(aEmployeeGroup + ' .employeeAdd_' + operationCount + '_' + employeeCount).click();
          employeeCount++;
        }
      }(i))
    }
    if (opEmArrLen !== objLen) {
      $(aOperationClass).next().click();
      operationCount++;
      employeeGroupCount++;
    }
  }
  $('.badRate').focus();
}
//解析 empArr 
function parseEmployeeOperation(empArr) {
  var obj = {}
  var opArr = [];
  var opLen = 0;
  for (var i = 0; i < empArr.length; i++) {
    var op = empArr[i].operation;
    var emNumber = empArr[i].employeeNumber;
    // var emName = empArr[i].employeeName;
    if (opArr.indexOf(op) == -1) {
      opArr.push(op)
      opLen++;
      obj[op] = [];
      obj[op].push(emNumber)
    } else {
      obj[op].push(emNumber)
    }
  }
  obj.length = opLen;
  return obj;
}
//获取 employee 

function getNoRepeatEmployees() {
  var employees = $('.addEmployee')
  var len = employees.length;
  var employeeArr = [];
  for (var i = 0; i < len; i++) {
    employeeArr.push(employees[i].value);
  }
  employeeArr = noRepeat(employeeArr);
  return employeeArr;
}


//修改select 默认选中
function selectSelected(select, option) {
  if (!option) {
    alert('传入选项不存在')
    return
  } else {
    $(select).find('option[value=' + option + ']').attr('selected', 'true');
  }
}
//获取出 mos中站点个数、站点名 ary
function getOperationCount(emps) {
  var res = {};
  var operationArray = [];
  for (var a in emps) {
    operationArray.push(emps[a].operation);
  }
  operationArray = noRepeat(operationArray);
  res.operationArray = operationArray;
  res.count = operationArray.length;
  return res;
}

//获取站点信息
function getOperationByScope(scope) {
  var data;
  $.ajax("/FHR/Mo.do?m=getOperationByScope", {
    'type': 'POST',
    'data': {
      'scope': scope
    },
    'async': false,
    'success': function (res, msg) {
      if (msg === 'success') {
        var json = JSON.parse(res);
        data = json.operation;
      }
    },
    'error': function () {}
  })
  return data;
}

//通过站点获取人
function getEmployeeByOperation(operationId) {
  var data = [];
  $.ajax('/FHR/Mo.do?m=getEmployeeByOperation', {
    'type': 'POST',
    'async': false,
    'data': {
      'operationId': operationId
    },
    'success': function (res, msg) {
      if (msg === 'success') {
        var json = JSON.parse(res);
        var arr = json.employee;
        for (var i = 0; i < arr.length; i++) {
          var item = {};
          item.oid = arr[i].oid;
          item.oname = arr[i].oid + '-' + arr[i].oname;
          data.push(item);
        }
      }
    }
  })
  return data;
}
//保存MO
function saveMo(saveStr) {
  // var saveStr = '{"insertOption":{"happenDate":"2019/04/27","insertScope":"M1","insertMachineKind":"S0451","insertMoKind":"1","insertTrainingAgain":"1","insertManagePerson":"C1311807","insertMainState":"outLook","insertExceptionTypes":"异常类型","memo":"test","badCount":"10","porductCount":"100"},"employeeArr":["C1204637","C1111633","C1206822","C0905660"],"msg":"save"}';
  var saveSuccess;
  $.ajax('/FHR/Mo.do?m=saveMo', {
    'type': 'POST',
    'async': false,
    'data': {
      'moMsg': saveStr
    },
    'success': function (res, msg) {
      if (msg === 'success') {
        saveSuccess = true;
        alert("保存成功！")
        location.reload();
      }
    },
    'error': function () {
      saveSuccess = true;
      alert("保存失败");
    }
  })
  return saveSuccess;
}
//获取机种   上线时 修改url
function getMachineKink() {
  $.ajax('/QMS/rest/getallImprojectList.do',{
  // $.ajax('http://myivo.ivo.com.cn/QMS/rest/getallImprojectList.do', {
    'type': 'GET',
    'async': false,
    'success': function (res, msg) {
      if (msg === 'success') {
        var json = JSON.parse(res);
        var noReplace = {};
        for (var a in json) {
          noReplace[json[a].project.split(' ')[0]] = 0;
        }
        for (var a in noReplace) {
          var item = {};
          item.oid = a;
          item.oname = a;
          machineKinkArr.push(item);
        }
      }
      //插入机种信息
      fillSelect(machineKinkArr, '#machineKind');
      $('#machineKind').chosen({'allow_single_deselect':true});
    }
  })

}

//数组填充 select
function fillSelect(data, tar) {
  if (data === undefined || tar === undefined) {
    return;
  }
  var a = $(tar);
  $(tar).empty();
  var inner = '';
  inner += '<option value=""> </option>';
  for (var i = 0; i < data.length; i++) {
    inner += '<option value="' + data[i].oid + '">' + data[i].oname + '</option>'
  }
  $(tar).html(inner);
}

// 初始化、插入 站点人员 组  init true 则先清空

/**
 * 
 *  现在的问题是  change 的时候后  init  使用的是变量  operationcount 
 * 
 *  同时存在两个 option
 * 
 *  变第一个的时候 这时 operationCount 已变成 2 
 *  
 *  operation1 init 的时候 init 了 2  所以  修改办法就是  通过  在插入html 的时候  将 data 直接插入到 html
 * 
 *  不通过 变量 operation 而 通过 getAttribute   判断  operation 是否为1 
 */
function insertOperationGroup(operationCount, operationArray, init) {
  if (init) {
    $('.employeeInfo').empty()
  }
  var item = $('<div class="operationGroup operationGroup_' + operationCount + '" data-theOperationCount="' + operationCount + '">\
    <div class="aOperation">\
      <label for="operation">站点:</label>\
      <select name="operation" id="operation" class="form-control operation operations operation_' + operationCount + '" data-theOperationCount="' + operationCount + '">\
        <option value=""></option>\
      </select>\
      <div class="operationAdd_' + operationCount + ' operationAdd" data-theOperationCount="' + operationCount + '">\
        <img src="./moDist/img/add.png" alt="添加站点">\
      </div>\
      <div class="operationDel_' + operationCount + ' operationDel" data-theOperationCount="' + operationCount + '">\
        <img src="./moDist/img/del.png" alt="删除站点">\
      </div>\
      <div class="operationClear"></div>\
    </div>\
    <label for="addEmployee">人员</label>\
    <div class="employeeGroup employeeGroup_' + operationCount + '" data-theOperationCount="' + operationCount + '">\
      <div class="aEmployee">\
        <select name="addEmployee" id="addEmployee" class="form-control addEmployee">\
          <option value=""></option>\
        </select>\
        <div class="employeeAdd employeeAdd_' + operationCount + '">\
          <img src="./moDist/img/add.png" alt="添加人员">\
        </div>\
        <div class="employeeDel employeeDel_' + operationCount + '">\
          <img src="./moDist/img/del.png" alt="删除人员">\
        </div>\
      </div>\
      <div class="employeeClear employeeClear_' + operationCount + '"></div>\
    </div>\
  </div>')
  $('.employeeInfo').append(item)
  var aOperationClass = '.operation_' + operationCount;
  fillSelect(operationArray, aOperationClass)

  $('.operationAdd_' + operationCount).click(function () {
    operationCount++;
    insertOperationGroup(operationCount, operationArray)
  })

  $('.operationDel_' + operationCount).click(function () {
    $(this).parent().parent().remove();
  })

  $('.operation_' + operationCount).change(function () {
    var employeeData = getEmployeeByOperation($(this).val())
    var employeeCount = 1;
    var thisOperationCount = $(this).attr('data-theOperationCount');
    insertEmployee(employeeCount, thisOperationCount, employeeData, '.employeeGroup_' + thisOperationCount, 'init');
    // $('.addEmployee').chosen({no_results_text:'输入有错!'});
    $('.addEmployee').click(function(){
      $(this).chosen({no_results_text:'输入有错!'});
    })
  })
}
/**
 * 选择站点后  插入选择人。
 * 
 * @param {第几个人} employeeCount 
 * @param {第几个站点} operationCount 
 * @param {人员信息} employeeData 
 * @param {插入的 站点组} target 
 * @param {是否初始化} init 
 */
function insertEmployee(employeeCount, operationCount, employeeData, target, init) {
  if (init) {
    $(target).empty()
    var item = $('<div class="employeeClear employeeClear_' + operationCount + '"></div>');
    $(target).append(item);
  }
  var item = $('<div class="aEmployee">\
                  <select name="addEmployee" id="addEmployee" class="form-control addEmployee addEmployee_' + operationCount + '_' + employeeCount + '">\
                    <option value=""></option>\
                  </select>\
                  <div class="employeeAdd employeeAdd_' + operationCount + '_' + employeeCount + '">\
                    <img src="./moDist/img/add.png" alt="添加人员">\
                  </div>\
                  <div class="employeeDel employeeDel_' + operationCount + '_' + employeeCount + '">\
                    <img src="./moDist/img/del.png" alt="删除人员">\
                  </div>\
                </div>')
  $('.employeeClear_' + operationCount).before(item);

  var aEmployeeClass = '.addEmployee_' + operationCount + '_' + employeeCount;
  fillSelect(employeeData, aEmployeeClass);
  
  
  $('.employeeAdd_' + operationCount + '_' + employeeCount).click(function () {
    employeeCount++;
    insertEmployee(employeeCount, operationCount, employeeData, target);
    // $('.addEmployee').chosen({no_results_text:'输入有错!'});
    $('.addEmployee').click(function(){
      $(this).chosen({no_results_text:'输入有错!'});
    })
  })

  $('.employeeDel_' + operationCount + '_' + employeeCount).click(function () {
    $(this).parent().remove();
  })
}
//深度克隆
function deepClone(tar, obj) {
  var tar = tar || {};
  for (var prop in obj) {
    if (typeof (obj[prop]) == 'object') {
      tar[prop] = (obj[prop].constructor == 'Array') ? [] : {};
      deepClone(tar[prop], obj[prop]);
    } else {
      tar[prop] = obj[prop];
    }
  }
  return tar;
}
/**
 * 
 * @param {form表单选择器数组} elementSelectArray 
 * @param {要修改的json} targetJson 
 */
var addChangeValueToJson = (elementSelectArray, targetJson) => {
  for (var i = 0; i < elementSelectArray.length; i++) {
    if ($(elementSelectArray[i]).is('div')) {
      targetJson[elementSelectArray[i].slice(1, elementSelectArray[i].length)] = $(elementSelectArray[i]).html();
    } else {
      targetJson[elementSelectArray[i].slice(1, elementSelectArray[i].length)] = $(elementSelectArray[i]).val();
    }

    (function (j) {
      if ($(elementSelectArray[j]).is('div')) {
        $(elementSelectArray[j]).blur(function () {
          targetJson[elementSelectArray[j].slice(1, elementSelectArray[j].length)] = $(this).text()
        })
      } else {
        $(elementSelectArray[j]).change(
          function () {
            targetJson[elementSelectArray[j].slice(1, elementSelectArray[j].length)] = $(this).val();
          }
        )
      }
    }(i))
  }
}
//数组去重
function noRepeat(arr) {
  var obj = {};
  var tarArr = [];
  for (var a in arr) {
    if (arr[a] === '') {
      continue;
    }
    obj[arr[a]] = 1;
  }
  for (var b in obj) {
    tarArr.push(b);
  }
  return tarArr;
}

//bootstrap 日历插件
function buildCalendar(tarClass) {
  $('.' + tarClass).datetimepicker({
    language: 'fr',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
  });
}

//pageControll
function pageControll(moLen) {
  var allPage = Math.ceil(moLen / 10);
  $('.allPage').html(allPage);

  $('.prePage')[0].onclick = function () {
    if ( Number($('.nowPage').html()) <= '1' || Number($('.nowPage').html() > allPage)) {
      return;
    } else {
      var nowPage = $('.nowPage').html();
      $('.nowPage').html(+nowPage - 1);
      $('.nowPage').focus();
      $('.nowPage').blur();
      searchMo(mainOption);
    }
  }

  $('.aftPage')[0].onclick = function () {

    if ( Number($('.nowPage').html()) >= Number($('.allPage').html())) {
      return;
    } else {
      var nowPage = $('.nowPage').html();
      $('.nowPage').html(+nowPage + 1);
      $('.nowPage').focus();
      $('.nowPage').blur();
      searchMo(mainOption);
    }
  }
}

//获取 option 内容 返回json
function getOptionSetToJson(ele, tar) {
  var eles = $(ele + ' option');
  var len = eles.length;
  for (var i = 0; i < len; i++) {
    //得3 个厂
    var option = eles[i].value;
    if (option === '') {
      continue;
    } else {
      var operation = getOperationByScope(option);
      tar[option] = operation;
    }
  }
}

//添加 动画
function addAnimate(tar, animate) {
  var tarDom = document.querySelector(tar);
  var preClassName = tarDom.className;
  tarDom.className += ' animated ' + animate;
  setTimeout(() => {
    tarDom.className = preClassName;
  }, 800);
}     


//函数节流
function throttle(fn, delay) {
  var isFinished = true;
  return function () {
    if (!isFinished) {
      return
    } else {
      isFinished = false;
      var that = this;
      var args = arguments;
      setTimeout(() => {

        fn.apply(that, args);
        isFinished = true;
      }, delay);
    }
  }
}
