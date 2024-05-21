/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {RegisterLexicalSubscription} from './registerSubscription';

import useLexicalSubscription from '@lexical/react/useLexicalSubscription';
import {LexicalEditor} from 'lexical';
import {useCallback} from 'react';

export function useRegisterSubscription<T>(
  subscription: RegisterLexicalSubscription<T>,
): T {
  const sub = useCallback(
    (editor: LexicalEditor) => {
      return {
        initialValueFn: subscription.initialValueFn.bind(subscription, editor),
        subscribe: subscription.subscribe.bind(subscription, editor),
      };
    },
    [subscription],
  );
  return useLexicalSubscription(sub);
}
