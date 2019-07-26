"use strict";

//global 记录选项
var mainOption = {};
var insertOption = {}; //onload init

$('document').ready(function () {
  initMain();
});

function initMain() {
  //bootstrap 日历插件
  $('.form_date').datetimepicker({
    language: 'fr',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
  }); //select 插入value
  //获取站点

  getOperation(); //模态框开关

  $(".addNew").click(function () {
    $(".insertMo")[0].style.display = 'block';
    initInsertMo();
  });
  $(".closeBtn").click(function () {
    $('.insertMo').css({
      'display': 'none'
    });
  }); //要插入json的表单的 css选择器数组

  var elementSelectArray = ['#startDate', '#endDate', '#scope', '#moKind', '#mainType', '#exceptionTypes'];
  addChangeValueToJson(elementSelectArray, mainOption);
  $('.searchBtn').click(function () {
    console.log(mainOption);
  });
}