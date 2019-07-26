//global 记录选项
var mainOption = {};
var insertOption = {};
var allOperation = {};
var mosArr = {};
var machineKinkArr = [];
var moManager;
//截流标识
var saveFlag = true;
var user;

//onload init
$('document').ready(
	() => {
		// getUser();
		getMoManager();
		initMain();


	}
)

function initMain() {
	buildCalendar('form_date');

	//通过 获取全部option在初始化时查询出全部相关站点
	getOptionSetToJson('#scope', allOperation);
	//选择厂别   重新填充站点 select
	$("#scope").change(function () {
		var data = allOperation[$(this).val()];
		fillSelect(data, '#operation');
	})

	//插入机种信息
	getMachineKink();

	//查询主表
	searchMo();

	//模态框开关
	$(".addNew").click(() => {
		$(".insertMo")[0].style.display = 'block';
		initInsertMo();
	})

	//要插入json的表单的 css选择器数组
	var elementSelectArray = [
		'#startDate',
		'#endDate',
		'#scope',
		'#machineKind',
		'#operation',
		'#moKind',
		'#mainType',
		'#exceptionTypes',
		'#trainingResult',
		'.nowPage'
	];
	addChangeValueToJson(elementSelectArray, mainOption);
	//导出
	$('.export').click(function () {
		mainOption.export = 'export';
		searchMo(mainOption, 'export');
		mainOption.export = '';
	})
	//搜索
	$('.searchBtn').click(function () {
		searchMo(mainOption);
	})
	//初始化新增页面
	function initInsertMo() {
		var ele = '\
		<div class="bg">\
			<div class="title">新增MO</div>\
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
							<option value="" selected></option>\
						</select>\
						<label for="insertMoKind">MO类型:</label>\
						<select name="insertMoKind" id="insertMoKind" class="form-control moKind">\
							<option value="" selected></option>\
							<option value="0">一般事项</option>\
							<option value="1">重大MO</option>\
						</select>\
						<label for="insertTrainingAgain">复训:</label>\
						<select name="insertTrainingAgain" id="insertTrainingAgain" class="form-control trainingAgain">\
							<option value="" selected></option>\
							<option value="1">是</option>\
							<option value="0">否</option>\
						</select>\
						<label for="insertManagePerson">管理员</label>\
						<select name="insertManagePerson" id="insertManagePerson" class="form-control managePerson last">\
							<option value=""></option>\
						</select>\
						<label for="insertMainState">主状态:</label>\
					<select name="insertMainState" id="insertMainState" class="form-control mainState">\
						<option value="" selected></option>\
						<option value="外观">外观</option>\
						<option value="画质">画质</option>\
						<option value="Function">Function</option>\
					</select>\
					<label for="insertExceptionTypes">异常类型:</label>\
					<input type="text" class="form-control exceptionTypes" id="insertExceptionTypes" name="insertExceptionTypes">\
					<label for="productCount">作业数</label>\
					<input type="text" placeholder="数字" id="productCount" class="form-control productCount" name="porductCount" id="productCount">\
					<label for="badCount">不良数</label>\
					<input type="text"  placeholder="数字" class="form-control badCount" id="badCount">\
					<label for="badRate">不良率</label>\
					<input type="text"  readonly class="form-control badRate">\
				</div>\
				<form class="employeeInfo">\
				</form>\
				<label for="memo">备注:</label>\
				<div class="memo" id="memo" contenteditable="true">\
				</div>\
			</div>\
			<div class="bottomButton">\
					<div class="submit">提交</div>\
			</div>\
		</div>';
		$('.insertMo').html(ele);
		//插入管理员
		fillSelect(moManager,'#insertManagePerson');
		buildCalendar('form_date');
		$(".closeBtn").click(() => {
			$('.insertMo').css({
				'display': 'none'
			}).empty();
			insertOption = {};
		})
		//计算留任率
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
		var insertSelectArray = [
			'#happenDate', '#insertScope',
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
		//插入 机种信息
		fillSelect(machineKinkArr, '#insertMachineKind');
		$('#insertMachineKind').chosen({'allow_single_deselect':true})
		// $('#insertMachineKind').click(function(){
		// 	$(this).chosen({no_results_text:'输入有错!'});
		// })
		//厂别变换
		$('#insertScope').change(function () {
			var operationCount = 1;
			var operationArray = allOperation[$(this).val()];
			//插入 operation 组
			insertOperationGroup(operationCount, operationArray, 'init');
		})
		//提交
		var submitFlag = true;
		$('.submit').click(function () {
			//这里有时间的时候可以将   数组去重  抽离出  util
			if (submitFlag) {
				submitFlag = false;
				setTimeout(() => {
					submitFlag = true;
				}, 1000);
				var employees = $('.addEmployee')
				var len = employees.length;
				var employeeArr = [];
				for (var i = 0; i < len; i++) {
					employeeArr.push(employees[i].value);
				}
				employeeArr = noRepeat(employeeArr);
				//判断是否 选择人员
				if (employeeArr.length === 0) {
					alert("请选择人员");
					return
				}
				var saveJson = {}
				var cloneInsertOption = {};
				deepClone(cloneInsertOption, insertOption)
				saveJson.insertOption = cloneInsertOption;
				//判断基础添加是否填写全
				for (var item in cloneInsertOption) {
					var s = cloneInsertOption[item];
					if (s == "") {
						$('#' + item)[0].focus(); //有时间可以优化  给focus 的标签设置 动画 .class
						addAnimate('#' + item, 'bounce');
						return
					}
				}
				saveJson.employeeArr = employeeArr;
				saveJson.msg = 'save';
				var saveStr = JSON.stringify(saveJson)

				//提交截流
				if (saveFlag) {
					saveFlag = false;
					//保存Mo
					saveMo(saveStr);
					insertOption = {};
					$('.insertMo').empty().css({
						'display': 'none'
					});
				}
			} else {
				return;
			}
		})
	}
}