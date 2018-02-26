// @flow

import { compose, withPropsOnChange } from 'recompose';
import type { HOC } from 'recompose';
import { connect } from 'react-redux';
import List from './List';
import type { ListProps, ListOuterProps } from './List';
import { USER_HEIGHT } from '../../constants';

const mapState = ({ users }: StoreState): $Shape<ListProps> => ({
    users,
    length: users.length,
});

const enhance: HOC<ListProps, ListOuterProps> = compose(
    connect(mapState),
    withPropsOnChange(
        ['length'],
        ({ length }): $Shape<ListProps> => ({
            styleObj: { height: `${USER_HEIGHT * length}px` },
        }),
    ),
);

export default enhance(List);
