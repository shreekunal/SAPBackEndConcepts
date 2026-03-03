sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, Fragment, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("multipledestinoneui5.controller.View1", {

        onInit() {
            this.getView().setModel(new JSONModel({}), "bookDialog");
            this.getView().setModel(new JSONModel({}), "authorDialog");
        },

        // ─── shared dialog loader ──────────────────────────────────
        async _getDialog(sFragmentName, sModelName) {
            const sKey = "_" + sFragmentName;
            if (!this[sKey]) {
                this[sKey] = await Fragment.load({
                    id: this.getView().getId(),
                    name: "multipledestinoneui5.view." + sFragmentName,
                    controller: this
                });
                this[sKey].setModel(this.getView().getModel(sModelName), sModelName);
                this.getView().addDependent(this[sKey]);
            }
            return this[sKey];
        },
        // ─── BOOKS CRUD ───────────────────────────────────────────

        async onAddBook() {
            this.getView().getModel("bookDialog").setData({ title: "Add Book", ID: "", bookTitle: "", author: "", _mode: "add" });
            (await this._getDialog("BookDialog", "bookDialog")).open();
        },

        async onEditBook() {
            const oItem = this.byId("booksTable").getSelectedItem();
            if (!oItem) { MessageToast.show("Please select a book first"); return; }
            const oCtx = oItem.getBindingContext();
            this.getView().getModel("bookDialog").setData({
                title: "Edit Book",
                ID: oCtx.getProperty("ID"),
                bookTitle: oCtx.getProperty("title"),
                author: oCtx.getProperty("author"),
                _path: oCtx.getPath(),
                _mode: "edit"
            });
            (await this._getDialog("BookDialog", "bookDialog")).open();
        },

        async onSaveBook() {
            const oDialogModel = this.getView().getModel("bookDialog");
            const oData = oDialogModel.getData();
            const oModel = this.getView().getModel();

            if (oData._mode === "add") {
                await oModel.bindList("/Books").create({
                    ID: parseInt(oData.ID),
                    title: oData.bookTitle,
                    author: oData.author
                });
                MessageToast.show("Book created");
            } else {
                const oCtx = oModel.bindContext(oData._path);
                await oCtx.getBoundContext().setProperty("title", oData.bookTitle);
                await oCtx.getBoundContext().setProperty("author", oData.author);
                await oModel.submitBatch(oModel.getUpdateGroupId());
                MessageToast.show("Book updated");
            }
            this._BookDialog.close();
        },

        onCancelBook() {
            this._BookDialog?.close();
        },

        onDeleteBook() {
            const oItem = this.byId("booksTable").getSelectedItem();
            if (!oItem) { MessageToast.show("Please select a book first"); return; }
            MessageBox.confirm("Delete this book?", {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        await oItem.getBindingContext().delete("$auto");
                        MessageToast.show("Book deleted");
                    }
                }
            });
        },

        // ─── AUTHORS CRUD ──────────────────────────────────────────

        async onAddAuthor() {
            this.getView().getModel("authorDialog").setData({ title: "Add Author", name: "", birthYear: "", country: "", _mode: "add" });
            (await this._getDialog("AuthorDialog", "authorDialog")).open();
        },

        async onEditAuthor() {
            const oItem = this.byId("authorsTable").getSelectedItem();
            if (!oItem) { MessageToast.show("Please select an author first"); return; }
            const oCtx = oItem.getBindingContext("AUTHORS");
            this.getView().getModel("authorDialog").setData({
                title: "Edit Author",
                name: oCtx.getProperty("name"),
                birthYear: oCtx.getProperty("birthYear"),
                country: oCtx.getProperty("country"),
                _path: oCtx.getPath(),
                _mode: "edit"
            });
            (await this._getDialog("AuthorDialog", "authorDialog")).open();
        },

        async onSaveAuthor() {
            const oDialogModel = this.getView().getModel("authorDialog");
            const oData = oDialogModel.getData();
            const oModel = this.getView().getModel("AUTHORS");

            if (oData._mode === "add") {
                await oModel.bindList("/Authors").create({
                    name: oData.name,
                    birthYear: parseInt(oData.birthYear),
                    country: oData.country
                });
                MessageToast.show("Author created");
            } else {
                const oCtx = oModel.bindContext(oData._path);
                await oCtx.getBoundContext().setProperty("name", oData.name);
                await oCtx.getBoundContext().setProperty("birthYear", parseInt(oData.birthYear));
                await oCtx.getBoundContext().setProperty("country", oData.country);
                await oModel.submitBatch(oModel.getUpdateGroupId());
                MessageToast.show("Author updated");
            }
            this._AuthorDialog.close();
        },

        onCancelAuthor() {
            this._AuthorDialog?.close();
        },

        onDeleteAuthor() {
            const oItem = this.byId("authorsTable").getSelectedItem();
            if (!oItem) { MessageToast.show("Please select an author first"); return; }
            MessageBox.confirm("Delete this author?", {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        await oItem.getBindingContext("AUTHORS").delete("$auto");
                        MessageToast.show("Author deleted");
                    }
                }
            });
        }
    });
});
