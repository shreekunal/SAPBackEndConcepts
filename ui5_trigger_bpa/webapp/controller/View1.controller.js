sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("ui5triggerbpa.controller.View1", {

        onInit() {
        },

        onTriggerBPA: function () {
            var oView = this.getView();
            var oModel = oView.getModel(); // default model → /odata/v4/catalog/
            var oResultText = oView.byId("bpaResultText");

            var sOrderId = oView.byId("orderIdInput").getValue();
            var sOrderNo = oView.byId("orderNoInput").getValue();
            var sAmount = oView.byId("amountInput").getValue();
            var sCurrency = oView.byId("currencyInput").getValue();

            if (!sOrderId) {
                MessageToast.show("Please enter an Order ID");
                return;
            }

            oResultText.setText("Triggering workflow...");

            var oActionBinding = oModel.bindContext("/triggerWorkflow(...)");
            oActionBinding.setParameter("orderId", sOrderId);
            oActionBinding.setParameter("orderNo", sOrderNo);
            oActionBinding.setParameter("amount", parseFloat(sAmount) || 0);
            oActionBinding.setParameter("currency", sCurrency || "USD");

            oActionBinding.execute()
                .then(function () {
                    var oContext = oActionBinding.getBoundContext();
                    var oResult = oContext.getObject();
                    oResultText.setText("Workflow Instance ID: " + oResult.value);
                    MessageToast.show("Workflow Initiated!");
                })
                .catch(function (oError) {
                    oResultText.setText("Error triggering workflow");
                    MessageToast.show("Error triggering BPA");
                    console.error(oError);
                });
        }

    });
});