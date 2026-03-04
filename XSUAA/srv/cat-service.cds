@odata  @(requires: 'authenticated-user')
service CatalogService {
  entity Books {
    key ID     : Integer;
        title  : String;
        author : String;
  }

  function securityAction() returns String;
}
