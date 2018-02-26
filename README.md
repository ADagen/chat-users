За основу взят create-react-app  
Live demo: https://adagen.github.io/chat-users/  
Отчёт о покрытии flow-типами: https://adagen.github.io/chat-users/flow-coverage/  
  
Старт приложения:
```bash
yarn install
yarn start
```
Т.к. в условиях тестового задания прямо сказано, что лучше написать заглушку на фронтенде, так и было сделано. Используется мок WebSocket-сервера, все обращения к нему логируются в консоли браузера.
  
Было проверено на платформах:
* Chrome 64, Ubuntu 17.04
* Chrome 64, Ubuntu 16.04
* Chrome 64, macOS 10.12
* Chrome 64, Android 7.0
* FireFox 58, Ubuntu 16.04
* Safari 11.0, macOS 10.12


`main.js` весит гзипнутый довольно много. Основная причина этого - вспомогательные библиотеки, которые использованы в моке сервера (который в свою очередь загружается в клиенте):
* `people-names` - генерирует случайное имя для пользователя
* `random-sentence` - создаёт случайные фразы из бессмысленного набора букв

Flow
====
Для проверки аннотаций типов можно использовать команды:
```bash
yarn flow
yarn glow
```
Во второй команде используется сторонний форматтер ошибок.
Для локальной генерации отчёта о покрытии flow-типами используйте команду
```bash
yarn flow:coverage
```

Виртуальный скроллинг
=====================
Для боевого приложения лучше взять `react-virtualized`, но в рамках тестового задания полезнее это сделать самому.


Создам два дива: внешнюю обёртку и внутренний контейнер элементов (.List-wrap и .List-container).
Т.к. все загруженные элементы известны, я могу просто вычислить и установить высоту контейнера
(добавив overflow-y: scroll для враппера). Это даст для отдельного компонента прокручиваемый див,
который при необходимости можно растянуть на весь вьюпорт.
Теперь подписываюсь на изменения размера враппера и на прокрутку контейнера внутри враппера,
в результате получаю все необходимые данные, чтобы вычислить видимые в текущий момент элементы списка.
Соответственно рендерю только их.

Узкое место: детектор ресайза враппера. Для этого есть много подходов и вариантов,
начиная от setInterval с постоянным вычислением размеров и от IE-специфичных апи
до глобального события resize (с обработкой нужного элемента внутри коллбека) или просто jquery.
Я использовал новый ResizeObserver, на момент написания ТЗ он был без флага доступен только в Chrome 64
(только для десктопа, в Chrome 64 for Android по-прежнему под флагом),
под флагом начиная с Chrome Canary 55 согласно блогу Google и с 54 согласно [caniuse](https://caniuse.com/resizeobserver).
Для поддержки остальных браузеров использовал полифил
[resize-observer-polyfill](https://www.npmjs.com/package/resize-observer-polyfill).
Перед внедрением в production-код конечно же надо потратить отдельное время
на изучение работы полифила в браузерах, которые используются аудиторией продукта.


Точки улучшения
===============
* добавить redux-saga (или другой инструмент для управления сайд-эффектами). Сейчас в экшене `markAsRead` есть сайд-эффект (обращение к апи-утилитам).
* в реализации виртуального скроллинга перейти с дебаунса с помощью setTimeout на `requestAnimationFrame`.
* нормализовать стейт стора: отдельно хранить список юзеров, отдельно массив с их порядком:
```javascript
// отдельный тип для id пользователя
declare type UserUID = string;

declare type StoreState = {
    users: { [UserUID]: UserData },
    sequence: Array<UserUID>,
}
```
* иммутабельный массив (обычный ecmascript array) может быть требовательным для процессора и оперативной памяти на большом объёме данных. Было бы полезно перейти на какие-либо другие структуры данных для хранения `sequence`, например которые предоставляют Immutable.js или [List](https://www.npmjs.com/package/list).


Описание тестового задания:
===========================

Реализовать список собеседников в чате. В списке неограниченное кол-во пользователей.
Референс: https://vk.com/im , https://web.telegram.org/#/im

Элемент списка должен содержать:
1. Имя пользователя
2. Текст последнего сообщения
3. Дата последнего сообщения
4. Кол-во непрочитанных сообщений

Сортировка списка по дате последнего сообщения.
По клику на пользователя все сообщения необходимо отметить как прочитанные.

При открытии страницы должны быть отображены тестовые данные: 1000 пользователей.
На той же странице добавить нескольких тестовых кнопок, которые инициируют события с сервера:
1. Новое сообщение от пользователя, которого еще нет в списке
2. Новое сообщение от одного из последних 10 собеседников
3. Новое сообщение от случайного пользователя

В тестовом задании будет оцениваться:
1. Скорость и корректность работы интерфейса: пользователи не должны теряться или дублироваться
2. Взаимодействие с бэкендом: корректность API, кол-во запросов

Реализация бэкенда не будет оценена.
Лучше всего написать небольшую заглушку на фронтенде с возможностью просмотра запросов в консоли.
