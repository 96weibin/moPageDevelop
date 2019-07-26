"use strict";

//获取站点信息
var getOperation = function getOperation() {
  $.ajax("maintain.do?m=getOperationsByDepartmentForCombo", {
    'type': 'POST',
    'success': function success(res, err) {
      console.log(res);
    }
  });
};
/**
 * 
 * @param {form表单选择器数组} elementSelectArray 
 * @param {要修改的json} targetJson 
 */


var addChangeValueToJson = function addChangeValueToJson(elementSelectArray, targetJson) {
  for (var i = 0; i < elementSelectArray.length; i++) {
    (function (j) {
      $(elementSelectArray[j]).change(function () {
        targetJson[elementSelectArray[j].slice(1, elementSelectArray[j].length)] = $(this).val(); // console.log(targetJson)
      });
    })(i);
  }
};