import _ from "lodash"
import { Router, Express, NextFunction, Request, Response } from "express"
;(Symbol as unknown as { metadata: symbol }).metadata ??=
  Symbol("Symbol.metadata")

type handle = (req: Request, res: Response, next: NextFunction) => void

export const CONSTANT = {
  INTERFACE: "____sgrid@interface____",
  ROUTER_MAP: "____sgrid@router<>map____",
  HANDL_PATH_MAP: "____sgrid@handle<>path____",
  MEHOD_PATH_MAP: "____sgrid@method<>path____",
  READY_TO_LOAD_CONTROLLER: "____sgrid@read<>to<>load<>controller___"
}

function Controller(i: string) {
  return function (
    controller: new (ctx: Express) => {
      ctx: Express
      router?: Partial<Router>
    },
    context: ClassDecoratorContext
  ) {
    _.set(context.metadata!, CONSTANT.INTERFACE, i)
    _.set(context.metadata!, CONSTANT.ROUTER_MAP, new Map())
    _.set(controller.prototype, "router", Router())
    context.addInitializer(function () {
      setImmediate(() => {
        const rm = _.get(context.metadata, CONSTANT.ROUTER_MAP) as Map<
          string,
          Array<handle>
        >
        const mpm = _.get(context.metadata, CONSTANT.MEHOD_PATH_MAP) as Map<
          string,
          string
        >
        const r = _.get(controller.prototype, "router")
        rm.forEach((value, key) => {
          if (mpm.get(key) == "post") {
            r.post(i + key, ...value)
          }
          if (mpm.get(key) == "get") {
            r.get(i + key, ...value)
          }
        })
      })
    })
  }
}

const Get = (r: string) => {
  return function (value: handle, context: ClassMethodDecoratorContext) {
    if (!_.get(context.metadata!, CONSTANT.HANDL_PATH_MAP)) {
      _.set(context.metadata!, CONSTANT.HANDL_PATH_MAP, new WeakMap())
    }
    if (!_.get(context.metadata!, CONSTANT.MEHOD_PATH_MAP)) {
      _.set(context.metadata!, CONSTANT.MEHOD_PATH_MAP, new Map())
    }
    const hmp = _.get(context.metadata, CONSTANT.HANDL_PATH_MAP) as WeakMap<
      handle,
      string
    >
    hmp.set(value, r)
    const mpm = _.get(context.metadata, CONSTANT.MEHOD_PATH_MAP) as Map<
      string,
      string
    >
    mpm.set(r, "get")
    context.addInitializer(function () {
      const rm = _.get(context.metadata, CONSTANT.ROUTER_MAP) as Map<
        string,
        Array<handle>
      >
      if (!rm.get(r)) {
        rm.set(r, [])
      }
      const rr = rm.get(r)
      rr!.push(value)
    })
  }
}

const Post = (r: string) => {
  return function (value: handle, context: ClassMethodDecoratorContext) {
    if (!_.get(context.metadata!, CONSTANT.HANDL_PATH_MAP)) {
      _.set(context.metadata!, CONSTANT.HANDL_PATH_MAP, new WeakMap())
    }
    if (!_.get(context.metadata!, CONSTANT.MEHOD_PATH_MAP)) {
      _.set(context.metadata!, CONSTANT.MEHOD_PATH_MAP, new Map())
    }
    const hmp = _.get(
      context.metadata,
      CONSTANT.HANDL_PATH_MAP
    ) as unknown as WeakMap<handle, string>
    hmp.set(value, r)
    const mpm = _.get(context.metadata, CONSTANT.MEHOD_PATH_MAP) as Map<
      string,
      string
    >
    mpm.set(r, "post")
    context.addInitializer(function () {
      const rm = _.get(context.metadata, CONSTANT.ROUTER_MAP) as unknown as Map<
        string,
        Array<handle>
      >
      if (!rm.get(r)) {
        rm.set(r, [])
      }
      const rr = rm.get(r)
      rr!.push(value)
    })
  }
}

const PreHandle = (h: Array<unknown>) => {
  return function (value: handle, context: ClassMethodDecoratorContext) {
    context.addInitializer(function () {
      const hmp = _.get(
        context.metadata,
        CONSTANT.HANDL_PATH_MAP
      ) as unknown as WeakMap<handle, string>
      const r = hmp.get(value) as string // path
      const rm = _.get(context.metadata, CONSTANT.ROUTER_MAP) as unknown as Map<
        string,
        Array<handle>
      >
      if (!rm.get(r)) {
        rm.set(r, [])
      }
      const ar = rm.get(r) || []
      const newAr = [...(h as handle[]), ...ar]

      rm.set(r, newAr)
    })
  }
}

export { Controller, Get, Post, PreHandle }
