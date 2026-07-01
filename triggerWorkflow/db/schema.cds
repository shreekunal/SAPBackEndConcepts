namespace my.orders;

entity Orders {
    key ID       : Integer;
        OrderNo  : String(20);
        Amount   : Integer;
        Currency : String(5);
        Status   : String(20) default 'PENDING'; // PENDING | APPROVED | REJECTED
}
