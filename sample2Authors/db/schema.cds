namespace sample;

using { cuid, managed } from '@sap/cds/common';

entity Authors : cuid, managed {
  name      : String(100) @mandatory;
  birthYear : Integer;
  country   : String(50);
//   books     : Composition of many Books on books.author = $self;
}

