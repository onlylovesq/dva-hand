import React from "react";
import dva, { connect } from "./dva";
import { Route, push, ConnectedRouter, Router } from "./dva/router";
const delay = ms =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
// 1.通过执行dva方法获取一个app的应用实例
const app = dva();
// 注册模型 每个模型拥有一个命名空间,可以定义初始状态
app.model({
  namespace: "counter", // 命名空间
  state: { number: 0 }, // 初始状态
  reducers: {
    // 处理函数
    add(state, action) {
      return { number: state.number + 1 };
    },
    increment(state, action) {
      return { number: state.number - 1 };
    }
  },
  // 在effects都是generator 生成器
  effects: {
    *asyncAdd(action, { put, call, select }) {
      console.log("action", action);
      yield call(delay, 1000); // yield调用一个delay方法,返回一个proise,会等待在这里。等待到promise变成完成态
      yield put({ type: "counter/add" }); // 派发一个动作
      const state = yield select();
      console.log("state", state);
    },
    *asyncIncrement(action, { put, call }) {
      console.log("action", action);
      yield call(delay, 1000); // yield调用一个delay方法,返回一个proise,会等待在这里。等待到promise变成完成态
      yield put({ type: "counter/increment" }); // 派发一个动作
    },
    *goto(action, { put }) {
      console.log("action", action);
      console.log("push(action.to)", push(action.to));
      yield put(push(action.to));
    }
  }
});
// 状态树 {counter:{number:0}}
// 准备要渲染的组件
const Counter = connect(state => state.counter)(props => (
  <div>
    <p>{props.number}</p>
    <button
      onClick={() => {
        props.dispatch({ type: "counter/add" });
      }}
    >
      add
    </button>
    <button
      onClick={() => {
        props.dispatch({ type: "counter/asyncAdd" });
      }}
    >
      async_Add
    </button>
    <button
      onClick={() => {
        props.dispatch({ type: "counter/increment" });
      }}
    >
      increment
    </button>
    <button
      onClick={() => {
        props.dispatch({ type: "counter/asyncIncrement" });
      }}
    >
      async_Increment
    </button>
    <button
      onClick={() => {
        props.dispatch({ type: "counter/goto", to: "/" });
      }}
    >
      goto
    </button>
  </div>
));

const Home = () => <div>Home</div>;
// 配置路由
app.router(({ history, app }) => (
  // <ConnectedRouter history={history}>
  // <Router history={history}>
    <>
      <Route path="/" exact component={Home} />
      <Route path="/counter" exact component={Counter} />
    </>
  // </Router>
  // </ConnectedRouter>
));
// 启动应用
app.start("#root");
// ReactDOM.render(<Counter/>,doucument.querySelector('#root'));
