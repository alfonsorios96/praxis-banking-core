# ADR 0010: IBAN español y euro

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §1, §2.3

## Contexto

El core es español. El ADR 0005 fijó el peso mexicano y el ADR 0009 llamó Cheques a la cuenta operativa. Un banco español identifica la cuenta con un IBAN y expresa el dinero en euros.

El entero de la unidad menor y el ledger único no cambian. Cambia la moneda y el identificador de la cuenta.

## Decisión

- La moneda es **EUR**. `amountMinor` sigue siendo un entero de céntimos. La UI formatea con separador de miles `.`, decimal `,` y el símbolo `€`.
- La cuenta operativa se llama **Corriente** (`checking`). La de ahorro sigue siendo **Ahorro**. El administrador no tiene cuentas.
- Cada cuenta, incluida la tesorería, tiene un IBAN español (`ES` y 22 dígitos) único. El código de entidad de Praxis es `9090` y la sucursal `0001`. Los dígitos de control siguen el CCC y el módulo 97 del IBAN.
- El IBAN se deriva del titular y de la clase, así que repetir el alta no lo cambia.
- Un traspaso interno sigue debitando una cuenta propia y abonando la corriente del otro cuentahabiente. El resumen muestra los dos IBAN. Sin confirmar no hay asiento.
- Los documentos ya guardados en MXN se reescriben a EUR y reciben IBAN. Los céntimos de los asientos no se vuelven a calcular.

## Consecuencias

- La constitución pasa a 2.3.0. El §2.3 nombra el euro; el principio del entero y del ledger único sigue igual.
- No hay transferencias fuera de la app, ni BIC, ni adeudos. Tarjetas y pagos siguen en espera.
