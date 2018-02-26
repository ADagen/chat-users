// @flow

import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import cx from 'classnames';
import debounce from 'lodash.debounce'
import User from '../User';
import { USER_HEIGHT } from '../../constants';
import './List.css';

/**
 * Css-класс, который будет ставится во время скролла
 * @type {string}
 */
const SCROLLING: string = 'List-container-scrolling';

/**
 * Запас элементов, которые будут рендерится по-умолчанию за пределами вьюпорта.
 * Этот запас нужен т.к. браузер выдаёт событие скролла уже после самой прокрутки.
 * Из-за чего получается "проскальзывание" элементов.
 * Текущая скорость проскальзывания лежит в `List#state.rowSlipRatio`
 * При высокой скорости прокрутки запас элементов в направлении прокрутки увеличивается.
 * @constant List.RESERVE
 * @type {number}
 */
const RESERVE: number = 4;

/**
 * Cколько элементов будет рендерится максимум. Ограничение нужно,
 * т.к. в некоторых случаях "проскальзывает" слишком много элементов,
 * в результате вместо ускорения обработки списка получается замедление.
 * @constant List.MAX_RESERVE
 * @type {number}
 */
const MAX_RESERVE: number = 100;


/**
 * Тип внешних пропсов (публичных) компонента List
 * @typedef {Object} ListProps
 * @property {string} [className] - передаваемый извне className
 */
export type ListOuterProps = {
    className?: string,
}
/**
 * Тип внутренних пропсов (между контейнером и компонентом) компонента List
 * @typedef {Object} ListProps
 * @property {string} [className] - передаваемый извне className
 */
export type ListProps = ListOuterProps & {
    users: Array<any>,
    length: number,
    styleObj: {
        height: string,
    },
}

/**
 * Тип стейта компонента List.
 * rowSlipRatio зависит от текущей скорости прокрутки.
 * @typedef {Object} ListState
 * @property {number} rowSlipRatio - запас элементов, которые будут рендерится за пределами вьюпорта
 * @property {number} height - высота обёртки (т.е. вьюпорт List)
 * @property {number} scrollTop - смещение внутреннего контейнера по вертикали
 */
export type ListState = {
    rowSlipRatio: number,
    height: number,
    scrollTop: number,
}

/**
 * Компонент для поддержки списка пользователей.
 * Реализует т.н. виртуальный скроллинг, сам следит за высотой своего элемента.
 * @class List
 * @param {ListProps} props
 */
class List extends React.Component<ListProps, ListState> {

    /**
     * @property List#state
     * @type {ListState}
     */
    state = {
        rowSlipRatio: 4,
        height: 0,
        scrollTop: 0,
    };

    /**
     * Хранит ссылку на верхнюю обёртку
     * @property List#wrapRef
     * @type {?React.ElementRef}
     */
    wrapRef: ?React.ElementRef<'div'>;

    /**
     *
     * @method List#setWrapRef
     * @param {React.ElementRef} node
     * @returns {void}
     */
    setWrapRef: React.Ref<'div'> = node => { this.wrapRef = node };

    /**
     * Хранит ссылку на внутренний контейнер
     * @property List#containerRef
     * @type {?React.ElementRef}
     */
    containerRef: ?React.ElementRef<'div'>;

    /**
     *
     * @method List#setContainerRef
     * @param {React.ElementRef} node
     * @returns {void}
     */
    setContainerRef: React.Ref<'div'> = node => { this.containerRef = node };

    /**
     * Хранит текущее состояние scrollTop
     * @property List#scrollTop
     * @type {number}
     */
    scrollTop: number = 0;

    /**
     * Хранит id таймера для
     * @property List#timerPointerDisabled
     * @type {TimeoutID}
     */
    timerPointerDisabled: TimeoutID;

    /**
     * Обработчик скролла контейнера внутри враппера
     * TODO: рассмотреть вариант через rAF вместо setTimeout/debounce
     * @method List#onScroll
     * @param {Event} event
     * @returns {void}
     */
    onScroll = (event: Event): void => {
        const target = (event.currentTarget: window.HTMLElement);

        // игнор прокрутки за пределы (напр. на мобильных)
        if (target.scrollTop < 0) { return }

        // глобально выключу pointer-events для ускорения рендера браузерного движка
        const { containerRef } = this;
        if (!containerRef) { return }
        containerRef.classList.add(SCROLLING);
        clearTimeout(this.timerPointerDisabled);
        this.timerPointerDisabled = setTimeout(
            () => containerRef.classList.remove(SCROLLING),
            500,
        );

        this.scrollTop = target.scrollTop;

        // версия с дебаунсом
        this.setScrollTop();
    };

    /**
     * Перерендера DOM-дерева не будет, но лишней реконсиляции этим получится избежать
     * @method List#shouldComponentUpdate
     * @private
     * @param {ListProps} nextProps
     * @param {ListState} nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps: ListProps, nextState: ListState) {
        // const isDirtyScrollTop = nextState.scrollTop !== this.state.scrollTop;
        // const isDirtyHeight = nextState.height !== this.state.height;
        // return isDirtyScrollTop || isDirtyHeight;
        return true;
    }

    /**
     * Метод для установки scrollTop, debounced, вызывается раз в 50 мс.
     * @method List#setScrollTop
     * @returns {void}
     */
    setScrollTop = debounce(() => {
        const { scrollTop } = this;
        // scrollToRowCoeff - это эмпирически подобранное число,
        // показывает зависимость величины проскальзывания прокрутки от кол-ва запасных элементов.
        const scrollToRowCoeff = 40;
        const rowSlipRatio = Math.round((scrollTop - this.state.scrollTop) / scrollToRowCoeff);
        this.setState({ scrollTop, rowSlipRatio });
    }, {
        wait: 50,
        leading: true,
        trailing: true,
    });

    /**
     * Обработчик ресайза враппера
     * @method List#onResize
     * @param {ResizeObserverEntries} entries
     *      @param {ResizeObserverEntry} entries[0] - wrap
     * @returns {void}
     */
    onResize = ([wrap]: ResizeObserverEntries): void => {
        // Беру сразу нулевой элемент, чтобы не проверять на соответствие,
        // так как ResizeObserver для каждого инстанса List свой.
        // В более сложном случае тут должна быть проверка `wrap.target === this.wrapRef`
        const cr: DOMRectReadOnly = wrap.contentRect;
        const { height } = cr;
        this.setState({ height });
    };

    /**
     * Инстанс обсервера изменения размера
     * @property {List#ro}
     * @type {ResizeObserver}
     */
    ro = new ResizeObserver(this.onResize);

    componentDidMount() {
        if (this.wrapRef) {
            // стандартный реактовский onScroll не подошёл, т.к. не поддерживает passive: true
            this.wrapRef.addEventListener('scroll', this.onScroll, { passive: true });
            this.ro.observe(this.wrapRef);
        } else {
            const message = 'всё пропало';
            // тут Raven.captureMessage('message', { tags: {} })
            console.error(message);
        }

    }

    componentWillUnmount() {
        if (this.wrapRef) {
            this.wrapRef.removeEventListener('scroll', this.onScroll);
        }
    }

    componentDidCatch(error: Error, tags: Object) {
        // тут Raven.captureException(error, { tags });
        console.error(error);
    }

    /**
     *
     * @method List#renderElements
     * @private
     * @param {number} start начальный индекс для подмассива
     * @param {number} end конечный индекс для подмассива
     * @returns {React.Element}
     */
    renderElements(start: number, end: number) {
        const { users } = this.props;

        function getUserElement(user: UserData, index: number) {
            const globalIndex: number = start + index;
            return (
                <User
                    key={user.id}
                    globalIndex={globalIndex}
                    {...user}
                />
            )
        }

        return users.slice(start, end).map(getUserElement);
    }

    render() {
        const { height, scrollTop, rowSlipRatio } = this.state;
        const { className, styleObj, length } = this.props;
        // console.log(`[render], height=${height}, scrollTop=${scrollTop}`);

        // первое и последнее видимое во вьюпорте сообщение
        const firstVisibleMessage = Math.floor(scrollTop / USER_HEIGHT);
        const lastVisibleMessage = Math.ceil((scrollTop + height) / USER_HEIGHT);

        // резерв сообщений сверх и снизу
        // напр. при большой скорости вверх надо отрендерить больше сообщений сверху
        const normalizedSlip = Math.min(RESERVE + Math.abs(rowSlipRatio), MAX_RESERVE);
        const topReserve = rowSlipRatio < 0 ? normalizedSlip : RESERVE;
        const bottomReserve = rowSlipRatio > 0 ? normalizedSlip : RESERVE;

        // первое и последнее сообщение, которое надо отрендерить
        const startIndex = Math.max(0, firstVisibleMessage - topReserve);
        const endIndex = Math.min(length, lastVisibleMessage + bottomReserve);
        // console.log('msg to render:', startIndex, endIndex);

        return (
            <div className={cx('List-wrap', className)} ref={this.setWrapRef}>
                <div className="List-container" style={styleObj} ref={this.setContainerRef}>
                    {this.renderElements(startIndex, endIndex)}
                </div>
            </div>
        )
    }
}

export default List;
