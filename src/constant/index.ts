export enum tables {
  eff_event = "eff_event",
  eff_eve_comment = "eff_eve_comment",
  blog_user = "blog_user"
}

export enum eventStatus {
  created = 0,
  doing = 1,
  done = 2,
  overTime = 3,
  failed = -1
}

export enum dates {
  FMT = "YYYY-MM-DD HH:mm:ss"
}
export const NewError = function (code: number, msg: string) {
  return {
    code: code || -1,
    msg
  }
}

export function getConf() {
  const isProd = process.env.SGRID_PRODUCTION
  if (isProd) {
    return {
      nginxPath: "/etc/nginx/nginx.conf",
      historyDir: "history"
    }
  } else {
    return {
      nginxPath:
        "/Users/leemulus/GolandProjects/SimpExpansionServer/nginx.conf",
      historyDir: "history"
    }
  }
}
