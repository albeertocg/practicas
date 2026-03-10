## Explicación del Workflow

Este workflow implementa una automatización sencilla para evaluar el resultado académico de un estudiante.

El flujo comienza con un nodo **Manual Trigger**, que permite ejecutar el workflow manualmente desde la interfaz de n8n.

A continuación, el nodo **Set Datos Estudiante** define un conjunto de datos de prueba que representan la información de un estudiante: nombre, edad, curso, nota final y porcentaje de asistencia.

El nodo **IF Nota >= 5** evalúa la condición principal del ejercicio: comprobar si la nota final del estudiante es mayor o igual a 5.

Si la condición es verdadera, el flujo continúa hacia el nodo **Set Aprobado**, que genera un mensaje indicando que el estudiante ha aprobado el curso.

Si la condición es falsa, el flujo continúa hacia el nodo **Set Suspenso**, que genera un mensaje indicando que el estudiante no ha alcanzado la nota mínima requerida.

Este ejemplo demuestra el uso básico de:
- triggers
- manipulación de datos
- nodos condicionales
- ramificación de flujos en n8n.