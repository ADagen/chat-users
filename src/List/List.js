// @flow

import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import cx from 'classnames';
import debounce from 'lodash.debounce'
import User from '../User';
import './List.css';

/**
 * Запас сообщений, которые будут рендерится за пределами вьюпорта.
 * Подбирается эмрирически.
 * @constant List.RESERVE
 * @type {number}
 */
const RESERVE: number = 4;

const user = {
    name: 'ТестИмя',
    text: 'Съешь ещё этих мягких французских булочек, да выпей чаю',
    date: Date.now(),
    unread: 8,
};

const userList = Array(1000).fill(true).map((_, id) => ({ ...user, id }));
const userHeight = 50;

/**
 * Тип пропсов компонента List
 * @typedef {Object} ListProps
 * @property {string} [className] - передаваемый извне className
 */
type ListProps = {
    className?: string,
}

/**
 * Тип стейта компонента List
 * @typedef {Object} ListState
 * @property {number} height - высота обёртки (т.е. вьюпорт List)
 * @property {number} scrollTop - смещение внутреннего контейнера по вертикали
 */
type ListState = {
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
        height: 0,
        scrollTop: 0,
    };

    /**
     * Хранит ссылку на верхний контейнер для подписки на события.
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
     * Хранит текущее состояние scrollTop
     * @property List#scrollTop
     * @type {number}
     */
    scrollTop: number = 0;

    /**
     * Обработчик скролла контейнера внутри враппера
     * TODO: рассмотреть вариант через rAF вместо setTimeout/debounce
     * @method List#onScroll
     * @param {Event} event
     * @returns {void}
     */
    onScroll = (event: Event): void => {
        // подключать debounce ради одного использования посчитал излишним
        const target = (event.currentTarget: window.HTMLElement);
        this.scrollTop = target.scrollTop;
        this.setScrollTop();
    };

    /**
     * Метод для установки scrollTop, debounced, вызывается раз в 200 мс.
     * @method List#setScrollTop
     * @returns {void}
     */
    setScrollTop = debounce(() => {
        const { scrollTop } = this;
        this.setState({ scrollTop });
    }, {
        wait: 200,
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

    render() {
        const { height, scrollTop } = this.state;
        const { className } = this.props;
        console.log(`[render], height=${height}, scrollTop=${scrollTop}`);

        // первое и последнее видимое во вьюпорте сообщение
        const firstVisibleMessage = Math.floor(scrollTop / 50);
        const lastVisibleMessage = Math.ceil((scrollTop + height) / 50);

        // первое и последнее сообщение, которое надо отрендерить
        const startMsgId = Math.max(0, firstVisibleMessage - RESERVE);
        const endMsgId = Math.min(userList.length, lastVisibleMessage + RESERVE);
        console.log('msg to render:', startMsgId, endMsgId);

        return (
            <div className={cx('List-wrap', className)} ref={this.setWrapRef}>
                <div className="List-container" style={{ height: `${userHeight * userList.length}px` }}>
                    {userList.slice(startMsgId, endMsgId).map(user => (
                        <User key={user.id} {...user} />
                    ))}
                </div>
            </div>
        )
    }
}

export default List;
