import React from "react";
import { render } from "react-dom";
import { Provider, connect } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import {
  routerMiddleware,
  connectRouter,
  ConnectedRouter
} from "connected-react-router";
import { createBrowserHistory } from "history";
import * as effects from "redux-saga/effects";
const NAMESPACE_SEPERATOR = "/";

export { connect };
export default () => {
  const app = {
    model,
    _model: [],
    _router: null,
    router,
    start
  };
  function model(model) {
    app._model.push(model); // 把传入的model存起来
  }
  function router(routeConfig) {
    app._router = routeConfig; // 把路由的配置暂存起来
  }
  function start(root) {
    const history = createBrowserHistory();
    // 启动渲染
    const reducers = {
      router: connectRouter(history)
    };
    for (const model of app._model) {
      reducers[model.namespace] = (state = model.state, action) => {
        const actionType = action.type; // 获取动作类型 counter/add ['counter','add']
        const values = actionType.split(NAMESPACE_SEPERATOR);
        if (values[0] === model.namespace) {
          // 如果说命名空间的名字和动作命名空间一样的话
          const reducer = model.reducers[values[1]]; // 获取要进行计算状态的reducer
          if (reducer) return reducer(state, action);
        }
        return state;
      };
    }
    const reducer = combineReducers(reducers); // 合并reducer
    const sagaMiddleware = createSagaMiddleware();
    function* rootSaga() {
      for (const model of app._model) {
        for (const key in model.effects) {
          yield effects.takeEvery(
            `${model.namespace}${NAMESPACE_SEPERATOR}${key}`,
            model.effects[key],
            { type: `${model.namespace}${NAMESPACE_SEPERATOR}${key}`,to:'/' },
            effects
          );
        }
      }
    }

    const store = createStore(
      reducer,
      applyMiddleware(routerMiddleware(history), sagaMiddleware)
    ); // 创建仓库
    sagaMiddleware.run(rootSaga);
    const App = app._router({ history, app }); // 获取想要渲染的组件
    render(
      // 执行渲染
      <Provider store={store}>
        <ConnectedRouter history={history}>{App}</ConnectedRouter>
      </Provider>,
      document.querySelector(root)
    );
  }

  return app;
};

/**
 * reducers = {
 *  a:function(state,action){}
 *  b:function(state,action){}
 * }
 * result = combineReducers(reducers);
 * result = {
 *  a:xxx,
 *  b:yyy,
 * }
 */
