namespace my.orders;

entity Orders {
    key ID       : Integer;
        OrderNo  : String(20);
        Amount   : Decimal(10, 2);
        Currency : String(5);
        Status   : String(20) default 'PENDING'; // PENDING | APPROVED | REJECTED
}
