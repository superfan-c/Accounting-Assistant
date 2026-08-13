import type { Lang } from '../settings'

export type I18nKey =
  | 'appName'
  | 'appSlogan'
  | 'tabAdd'
  | 'tabRecords'
  | 'tabStats'
  | 'tabProfile'
  | 'loginTitle'
  | 'loginSubtitle'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'loginBtn'
  | 'registerBtn'
  | 'forgotPassword'
  | 'sendReset'
  | 'backToLogin'
  | 'resetTitle'
  | 'savePassword'
  | 'resetHint'
  | 'profile'
  | 'days'
  | 'count'
  | 'streak'
  | 'export'
  | 'logout'
  | 'logoutConfirm'
  | 'logoutContent'
  | 'settings'
  | 'settingsTitle'
  | 'bgSection'
  | 'fontSection'
  | 'langSection'
  | 'avatarSection'
  | 'uploadAvatar'
  | 'removeAvatar'
  | 'uploadBg'
  | 'resetBg'
  | 'fontDefault'
  | 'fontSerif'
  | 'fontSans'
  | 'fontMono'
  | 'langZh'
  | 'langEn'
  | 'langJa'
  | 'expense'
  | 'income'
  | 'byMonth'
  | 'byYear'
  | 'addRecord'
  | 'records'
  | 'statistics'
  | 'noEmail'
  | 'reminder'
  | 'reminderEnable'
  | 'reminderTime'
  | 'reminderTemplate'
  | 'reminderTplGentle'
  | 'reminderTplCasual'
  | 'reminderTplCustom'
  | 'reminderCustomPh'
  | 'reminderNoPush'
  | 'reminderOn'
  | 'reminderOff'
  | 'reminderOk'
  | 'reminderCancel'
  | 'reminderSaved'
  | 'reminderLoading'
  | 'permDenied'

const dict: Record<Lang, Record<I18nKey, string>> = {
  zh: {
    appName: '记账助手',
    appSlogan: '有事没事记一笔',
    tabAdd: '记账',
    tabRecords: '明细',
    tabStats: '统计',
    tabProfile: '我的',
    loginTitle: '记账助手',
    loginSubtitle: '登录后数据云端同步',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    loginBtn: '登录',
    registerBtn: '注册',
    forgotPassword: '忘记密码？',
    sendReset: '发送重置邮件',
    backToLogin: '返回登录',
    resetTitle: '设置新密码',
    savePassword: '保存密码',
    resetHint: '密码至少 6 位，保存后请用邮箱和密码登录',
    profile: '个人中心',
    days: '记账总天数',
    count: '记账总笔数',
    streak: '连续记账',
    export: '数据导出',
    logout: '退出登录',
    logoutConfirm: '确认退出登录？',
    logoutContent: '退出后需使用邮箱和密码重新登录',
    settings: '设置',
    settingsTitle: '设置',
    bgSection: '背景主题',
    fontSection: '文字类型',
    langSection: '语言',
    avatarSection: '头像',
    uploadAvatar: '上传头像',
    removeAvatar: '移除头像',
    uploadBg: '上传背景图',
    resetBg: '恢复默认',
    fontDefault: '默认',
    fontSerif: '衬线',
    fontSans: '黑体',
    fontMono: '等宽',
    langZh: '中文',
    langEn: 'English',
    langJa: '日本語',
    expense: '支出',
    income: '收入',
    byMonth: '按月查看',
    byYear: '按年查看',
    addRecord: '记一笔',
    records: '明细',
    statistics: '统计',
    noEmail: '未绑定邮箱',
    reminder: '记账提醒',
    reminderEnable: '开启提醒',
    reminderTime: '每天提醒时刻',
    reminderTemplate: '提醒文案',
    reminderTplGentle: '温柔提醒',
    reminderTplCasual: '有事没事记一笔',
    reminderTplCustom: '自定义',
    reminderCustomPh: '输入通知里要显示的一句话',
    reminderNoPush: '当前环境无法订阅推送（需要 HTTPS，并配置 VAPID 公钥）',
    reminderOn: '已开启',
    reminderOff: '已关闭',
    reminderOk: '确定',
    reminderCancel: '取消',
    reminderSaved: '提醒设置已保存',
    reminderLoading: '加载中…',
    permDenied: '通知权限被拒绝，关闭网页后将收不到提醒',
  },
  en: {
    appName: 'Ledger Assistant',
    appSlogan: 'Busy or not, log a little',
    tabAdd: 'Add',
    tabRecords: 'List',
    tabStats: 'Stats',
    tabProfile: 'Me',
    loginTitle: 'Ledger Assistant',
    loginSubtitle: 'Sign in to sync your data',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    loginBtn: 'Sign in',
    registerBtn: 'Sign up',
    forgotPassword: 'Forgot password?',
    sendReset: 'Send reset email',
    backToLogin: 'Back to sign in',
    resetTitle: 'Set a new password',
    savePassword: 'Save password',
    resetHint: 'At least 6 characters. Then sign in with email and password',
    profile: 'Profile',
    days: 'Active days',
    count: 'Entries',
    streak: 'Streak',
    export: 'Export CSV',
    logout: 'Log out',
    logoutConfirm: 'Log out?',
    logoutContent: 'You will need to sign in with email and password',
    settings: 'Settings',
    settingsTitle: 'Settings',
    bgSection: 'Background',
    fontSection: 'Font',
    langSection: 'Language',
    avatarSection: 'Avatar',
    uploadAvatar: 'Upload avatar',
    removeAvatar: 'Remove avatar',
    uploadBg: 'Upload image',
    resetBg: 'Reset',
    fontDefault: 'Default',
    fontSerif: 'Serif',
    fontSans: 'Sans',
    fontMono: 'Mono',
    langZh: '中文',
    langEn: 'English',
    langJa: '日本語',
    expense: 'Expense',
    income: 'Income',
    byMonth: 'By month',
    byYear: 'By year',
    addRecord: 'Add',
    records: 'Records',
    statistics: 'Statistics',
    noEmail: 'No email',
    reminder: 'Reminders',
    reminderEnable: 'Enable',
    reminderTime: 'Daily time',
    reminderTemplate: 'Message',
    reminderTplGentle: 'Gentle',
    reminderTplCasual: 'Busy or not, log a little',
    reminderTplCustom: 'Custom',
    reminderCustomPh: 'The sentence shown in the notification',
    reminderNoPush: 'Push is unavailable here (needs HTTPS and a VAPID public key)',
    reminderOn: 'On',
    reminderOff: 'Off',
    reminderOk: 'OK',
    reminderCancel: 'Cancel',
    reminderSaved: 'Reminder saved',
    reminderLoading: 'Loading…',
    permDenied: 'Notification permission denied; no alerts after the tab is closed',
  },
  ja: {
    appName: '記帳アシスタント',
    appSlogan: '暇でも忙しくても一筆',
    tabAdd: '記帳',
    tabRecords: '明細',
    tabStats: '統計',
    tabProfile: 'マイ',
    loginTitle: '記帳アシスタント',
    loginSubtitle: 'ログイン後クラウド同期',
    email: 'メール',
    password: 'パスワード',
    confirmPassword: 'パスワード確認',
    loginBtn: 'ログイン',
    registerBtn: '登録',
    forgotPassword: 'パスワードを忘れた？',
    sendReset: 'リセットメールを送信',
    backToLogin: 'ログインに戻る',
    resetTitle: '新しいパスワードを設定',
    savePassword: 'パスワードを保存',
    resetHint: '6文字以上。保存後はメールとパスワードでログインします',
    profile: 'マイページ',
    days: '記帳日数',
    count: '記帳件数',
    streak: '連続記帳',
    export: 'CSV出力',
    logout: 'ログアウト',
    logoutConfirm: 'ログアウトしますか？',
    logoutContent: '再ログインにはメールとパスワードが必要です',
    settings: '設定',
    settingsTitle: '設定',
    bgSection: '背景',
    fontSection: 'フォント',
    langSection: '言語',
    avatarSection: 'アバター',
    uploadAvatar: '画像をアップロード',
    removeAvatar: '削除',
    uploadBg: '背景をアップロード',
    resetBg: 'リセット',
    fontDefault: '標準',
    fontSerif: '明朝',
    fontSans: 'ゴシック',
    fontMono: '等幅',
    langZh: '中文',
    langEn: 'English',
    langJa: '日本語',
    expense: '支出',
    income: '収入',
    byMonth: '月別',
    byYear: '年別',
    addRecord: '記帳',
    records: '明細',
    statistics: '統計',
    noEmail: '未設定',
    reminder: '記帳リマインダー',
    reminderEnable: '有効にする',
    reminderTime: '毎日の時刻',
    reminderTemplate: '通知文',
    reminderTplGentle: 'やさしい',
    reminderTplCasual: '暇でも忙しくても一筆',
    reminderTplCustom: 'カスタム',
    reminderCustomPh: '通知に出す一文',
    reminderNoPush: 'この環境ではプッシュできません（HTTPS と VAPID 公開鍵が必要）',
    reminderOn: 'オン',
    reminderOff: 'オフ',
    reminderOk: '確定',
    reminderCancel: 'キャンセル',
    reminderSaved: 'リマインダーを保存しました',
    reminderLoading: '読み込み中…',
    permDenied: '通知が拒否されました。タブを閉じると通知できません',
  },
}

export function translate(lang: Lang, key: I18nKey): string {
  return dict[lang][key] ?? dict.zh[key] ?? key
}
