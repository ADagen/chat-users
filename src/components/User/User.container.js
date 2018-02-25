// @flow

import { pure, compose } from 'recompose';
import type { HOC } from 'recompose';
import User from './User';
import type { UserProps } from './User';

const enhance: HOC<UserProps, UserProps> = compose(
    pure,
);

export default enhance(User);
