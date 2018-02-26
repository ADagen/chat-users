// @flow

import { compose, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import type { HOC } from 'recompose';
import User from './User';
import type { UserInnerProps, UserOuterProps } from './User';
import { markAsRead } from '../../redux/actions';

const mapDispatch: $Shape<UserInnerProps> = {
    markAsRead,
};

const enhance: HOC<UserInnerProps, UserOuterProps> = compose(
    connect(null, mapDispatch),
    withHandlers({
        read: ({ id, markAsRead, unread }: UserInnerProps) => () => {
            if (unread > 0) {
                markAsRead(id);
            }
        },
    }),
);

export default enhance(User);
