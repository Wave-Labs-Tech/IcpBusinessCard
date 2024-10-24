Función para que el owner de una "Company" pueda vincular una Card existente con su Company, en calidad de empleado, bajo aprobación del dueño de la Card.

Ampliar los campos editables de una Card. Actualmente limitado a email, teléfono, skils y posiciones. Dependiendo de los cambios efectuados, marcar la Card como no verificada y activar una nueva instancia de verificación para volver a marcarla como verificada. 

Implementar función para editar datos de una Company y si los cambios lo requieren solicitar nueva verificación para volver a marcar la Company como verificada

Implementar instancia de verificación de Companies y Cards. Agregar campo verified a ambas entidades

Implementar requerimiento de pago para la emisión de Cards para terceros (solo los perfiles Company verificados pueden efectuar dicha acción)

Agregar instancia de aprobación por parte del destinatario de una Card creada por una Company (función createCardFor()).

Implementar mecanismo de registro de eventos celebrados por dos Cards. Dado que estos registros pueden contener una cantidad de datos importante por la incorporación de archivos multimedia o documentos que certifiquen el evento celebrado, será necesario persistir dichos registros en canister class autogenerados desde el canister principal, en la medida que los canister class existentes se vayan llenando.

Debido a la posible sensibilidad del contenido de los archivos anteriormente mensionados se prevee la posibilidad de que los involucrados en un evento puedan establecer la visibilidad del mismo como privada o parcialmente privada.

Los eventos que involucren el almacenamiento de archivos multimedia pueden requerir un pago adicional.






