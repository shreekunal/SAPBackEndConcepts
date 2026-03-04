sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("ui5appusingxsuaa.controller.View1", {
        onInit() {
        },

        onCheckSecurity: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oResultText = oView.byId("securityResult");

            var oActionBinding = oModel.bindContext("/securityAction(...)");

            oActionBinding
                .execute()
                .then(function () {
                    var oResult = oActionBinding.getBoundContext().getObject();
                    var oScopes;

                    try {
                        oScopes = JSON.parse(oResult.value);
                    } catch (e) {
                        oResultText.setText("Could not parse security response");
                        return;
                    }

                    var sText = Object.entries(oScopes)
                        .map(function ([key, val]) {
                            return key + ": " + (val ? "✅" : "❌");
                        })
                        .join("  |  ");

                    oResultText.setText(sText);
                    MessageToast.show("Security scopes loaded");
                })
                .catch(function (oError) {
                    oResultText.setText("Error fetching security info");
                    MessageToast.show("Error fetching security info");
                    console.error(oError);
                });
        }
    });
});