(function(window,$) {

    var attackDefendView = new R.View("#attackDefendContainer", {
        fetchUrl: '/w20e/goform/getAttackDefense',
        submitUrl: '/w20e/goform/setIpAttackDefense',
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
        },
        events: {
            '#saveBtn ,click': function() {
                attackDefendView.submit();
            },
            '#cancelBtn, click': function() {
                attackDefendView.initElements();
            }
        }});
    
}(window,$))