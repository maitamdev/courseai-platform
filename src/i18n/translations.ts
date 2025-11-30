export type Language = 'vi' | 'en';

export interface TranslationKeys {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    all: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    confirm: string;
    close: string;
    viewAll: string;
    seeMore: string;
    noData: string;
    welcome: string;
    logout: string;
    login: string;
    register: string;
    or: string;
    and: string;
  };
  
  // Navigation
  nav: {
    home: string;
    courses: string;
    games: string;
    forum: string;
    friends: string;
    messages: string;
    events: string;
    social: string;
    rewards: string;
    shop: string;
    profile: string;
    settings: string;
  };

  // Auth
  auth: {
    loginTitle: string;
    registerTitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    forgotPassword: string;
    resetPassword: string;
    noAccount: string;
    hasAccount: string;
    loginSuccess: string;
    registerSuccess: string;
    loginError: string;
    invalidEmail: string;
    weakPassword: string;
  };

  // Dashboard
  dashboard: {
    welcomeBack: string;
    level: string;
    xp: string;
    coins: string;
    streak: string;
    dailyRewards: string;
    quickActions: string;
    continueLearning: string;
    yourProgress: string;
    recentActivity: string;
  };

  // Courses
  courses: {
    title: string;
    allCourses: string;
    myCourses: string;
    purchased: string;
    free: string;
    premium: string;
    lessons: string;
    students: string;
    rating: string;
    duration: string;
    difficulty: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    startLearning: string;
    continueLearning: string;
    completed: string;
    progress: string;
    buyNow: string;
    enrolled: string;
    notEnrolled: string;
  };

  // Forum
  forum: {
    title: string;
    subtitle: string;
    newPost: string;
    askQuestion: string;
    categories: string;
    latestPosts: string;
    trending: string;
    unanswered: string;
    solved: string;
    bookmarks: string;
    notifications: string;
    replies: string;
    views: string;
    votes: string;
    postTitle: string;
    postContent: string;
    selectCategory: string;
    tags: string;
    tagsPlaceholder: string;
    submitPost: string;
    reply: string;
    replyPlaceholder: string;
    submitReply: string;
    markAsSolved: string;
    acceptedAnswer: string;
    editPost: string;
    deletePost: string;
    deleteConfirm: string;
    reportPost: string;
    noPostsYet: string;
    beFirstToPost: string;
    searchPosts: string;
    sortBy: string;
    newest: string;
    oldest: string;
    mostVotes: string;
    mostViews: string;
    tips: string;
    tipsContent: string[];
  };

  // Games
  games: {
    title: string;
    playNow: string;
    leaderboard: string;
    yourScore: string;
    highScore: string;
    level: string;
    lives: string;
    time: string;
    score: string;
    gameOver: string;
    youWin: string;
    tryAgain: string;
    nextLevel: string;
    codeBattle: string;
    codeHero: string;
    javaNinja: string;
    dungeonQuest: string;
  };

  // Friends
  friends: {
    title: string;
    allFriends: string;
    online: string;
    offline: string;
    pending: string;
    addFriend: string;
    removeFriend: string;
    acceptRequest: string;
    declineRequest: string;
    sendMessage: string;
    viewProfile: string;
    noFriends: string;
    searchFriends: string;
    friendRequests: string;
    sentRequests: string;
  };

  // Messages
  messages: {
    title: string;
    newMessage: string;
    typeMessage: string;
    send: string;
    noMessages: string;
    online: string;
    offline: string;
    typing: string;
    seen: string;
    delivered: string;
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    changeAvatar: string;
    bio: string;
    joinedDate: string;
    totalXP: string;
    coursesCompleted: string;
    achievements: string;
    statistics: string;
    activityHistory: string;
  };

  // Shop
  shop: {
    title: string;
    buyCoins: string;
    items: string;
    avatars: string;
    themes: string;
    powerUps: string;
    price: string;
    owned: string;
    buy: string;
    equip: string;
    equipped: string;
    insufficientCoins: string;
  };

  // Rewards
  rewards: {
    title: string;
    dailyReward: string;
    claimReward: string;
    claimed: string;
    comeBackTomorrow: string;
    streak: string;
    streakBonus: string;
    luckyWheel: string;
    spin: string;
    spinsLeft: string;
    quests: string;
    dailyQuests: string;
    weeklyQuests: string;
    questCompleted: string;
  };

  // Events
  events: {
    title: string;
    upcoming: string;
    ongoing: string;
    past: string;
    register: string;
    registered: string;
    participants: string;
    startDate: string;
    endDate: string;
    prize: string;
    rules: string;
  };

  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    noNotifications: string;
    newReply: string;
    newMessage: string;
    friendRequest: string;
    achievement: string;
    reward: string;
  };

  // Time
  time: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    yearsAgo: string;
  };

  // Errors
  errors: {
    general: string;
    network: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    tryAgain: string;
  };
}

const vi: TranslationKeys = {
  common: {
    loading: 'Đang tải...',
    error: 'Có lỗi xảy ra',
    success: 'Thành công',
    cancel: 'Hủy',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    all: 'Tất cả',
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước đó',
    submit: 'Gửi',
    confirm: 'Xác nhận',
    close: 'Đóng',
    viewAll: 'Xem tất cả',
    seeMore: 'Xem thêm',
    noData: 'Không có dữ liệu',
    welcome: 'Chào mừng',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    or: 'hoặc',
    and: 'và',
  },

  nav: {
    home: 'Trang chủ',
    courses: 'Khóa học',
    games: 'Trò chơi',
    forum: 'Diễn đàn',
    friends: 'Bạn bè',
    messages: 'Tin nhắn',
    events: 'Sự kiện',
    social: 'Cộng đồng',
    rewards: 'Phần thưởng',
    shop: 'Cửa hàng',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
  },

  auth: {
    loginTitle: 'Đăng nhập',
    registerTitle: 'Tạo tài khoản',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    username: 'Tên người dùng',
    forgotPassword: 'Quên mật khẩu?',
    resetPassword: 'Đặt lại mật khẩu',
    noAccount: 'Chưa có tài khoản?',
    hasAccount: 'Đã có tài khoản?',
    loginSuccess: 'Đăng nhập thành công!',
    registerSuccess: 'Đăng ký thành công!',
    loginError: 'Email hoặc mật khẩu không đúng',
    invalidEmail: 'Email không hợp lệ',
    weakPassword: 'Mật khẩu quá yếu',
  },

  dashboard: {
    welcomeBack: 'Chào mừng trở lại',
    level: 'Cấp độ',
    xp: 'Kinh nghiệm',
    coins: 'Xu',
    streak: 'Chuỗi ngày',
    dailyRewards: 'Phần thưởng hàng ngày',
    quickActions: 'Thao tác nhanh',
    continueLearning: 'Tiếp tục học',
    yourProgress: 'Tiến độ của bạn',
    recentActivity: 'Hoạt động gần đây',
  },

  courses: {
    title: 'Khóa học',
    allCourses: 'Tất cả khóa học',
    myCourses: 'Khóa học của tôi',
    purchased: 'Đã mua',
    free: 'Miễn phí',
    premium: 'Premium',
    lessons: 'bài học',
    students: 'học viên',
    rating: 'đánh giá',
    duration: 'Thời lượng',
    difficulty: 'Độ khó',
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    startLearning: 'Bắt đầu học',
    continueLearning: 'Tiếp tục học',
    completed: 'Hoàn thành',
    progress: 'Tiến độ',
    buyNow: 'Mua ngay',
    enrolled: 'Đã đăng ký',
    notEnrolled: 'Chưa đăng ký',
  },

  forum: {
    title: 'Diễn Đàn Hỏi Đáp',
    subtitle: 'Nơi kết nối để chia sẻ kiến thức, học tập',
    newPost: 'Bài viết mới',
    askQuestion: 'Đặt câu hỏi',
    categories: 'Danh mục',
    latestPosts: 'Bài viết mới nhất',
    trending: 'Xu hướng',
    unanswered: 'Chưa trả lời',
    solved: 'Đã giải quyết',
    bookmarks: 'Đã lưu',
    notifications: 'Thông báo',
    replies: 'câu trả lời',
    views: 'lượt xem',
    votes: 'votes',
    postTitle: 'Tiêu đề',
    postContent: 'Nội dung chi tiết',
    selectCategory: 'Chọn danh mục',
    tags: 'Tags',
    tagsPlaceholder: 'react, hooks, state (phân cách bằng dấu phẩy)',
    submitPost: 'Đăng câu hỏi',
    reply: 'Trả lời',
    replyPlaceholder: 'Viết câu trả lời của bạn...',
    submitReply: 'Gửi trả lời',
    markAsSolved: 'Đánh dấu là câu trả lời đúng',
    acceptedAnswer: 'Câu trả lời được chấp nhận',
    editPost: 'Sửa bài viết',
    deletePost: 'Xóa bài viết',
    deleteConfirm: 'Bạn có chắc muốn xóa?',
    reportPost: 'Báo cáo',
    noPostsYet: 'Chưa có bài viết nào',
    beFirstToPost: 'Đặt câu hỏi đầu tiên',
    searchPosts: 'Tìm kiếm bài viết...',
    sortBy: 'Sắp xếp theo',
    newest: 'Mới nhất',
    oldest: 'Cũ nhất',
    mostVotes: 'Nhiều vote nhất',
    mostViews: 'Nhiều lượt xem nhất',
    tips: 'Mẹo đặt câu hỏi hay',
    tipsContent: [
      'Tiêu đề ngắn gọn, rõ ràng',
      'Mô tả chi tiết vấn đề',
      'Đính kèm code nếu có',
      'Chọn đúng danh mục',
    ],
  },

  games: {
    title: 'Trò Chơi',
    playNow: 'Chơi ngay',
    leaderboard: 'Bảng xếp hạng',
    yourScore: 'Điểm của bạn',
    highScore: 'Điểm cao nhất',
    level: 'Cấp độ',
    lives: 'Mạng',
    time: 'Thời gian',
    score: 'Điểm',
    gameOver: 'Kết thúc',
    youWin: 'Chiến thắng!',
    tryAgain: 'Thử lại',
    nextLevel: 'Cấp tiếp theo',
    codeBattle: 'Code Battle Arena',
    codeHero: 'Code Hero',
    javaNinja: 'Java Ninja',
    dungeonQuest: 'Dungeon Code Quest',
  },

  friends: {
    title: 'Bạn bè',
    allFriends: 'Tất cả bạn bè',
    online: 'Đang online',
    offline: 'Offline',
    pending: 'Đang chờ',
    addFriend: 'Kết bạn',
    removeFriend: 'Hủy kết bạn',
    acceptRequest: 'Chấp nhận',
    declineRequest: 'Từ chối',
    sendMessage: 'Nhắn tin',
    viewProfile: 'Xem hồ sơ',
    noFriends: 'Chưa có bạn bè',
    searchFriends: 'Tìm kiếm bạn bè...',
    friendRequests: 'Lời mời kết bạn',
    sentRequests: 'Đã gửi lời mời',
  },

  messages: {
    title: 'Tin nhắn',
    newMessage: 'Tin nhắn mới',
    typeMessage: 'Nhập tin nhắn...',
    send: 'Gửi',
    noMessages: 'Chưa có tin nhắn',
    online: 'Đang hoạt động',
    offline: 'Không hoạt động',
    typing: 'đang nhập...',
    seen: 'Đã xem',
    delivered: 'Đã gửi',
  },

  profile: {
    title: 'Hồ sơ',
    editProfile: 'Chỉnh sửa hồ sơ',
    changeAvatar: 'Đổi ảnh đại diện',
    bio: 'Giới thiệu',
    joinedDate: 'Tham gia từ',
    totalXP: 'Tổng XP',
    coursesCompleted: 'Khóa học hoàn thành',
    achievements: 'Thành tựu',
    statistics: 'Thống kê',
    activityHistory: 'Lịch sử hoạt động',
  },

  shop: {
    title: 'Cửa hàng',
    buyCoins: 'Mua xu',
    items: 'Vật phẩm',
    avatars: 'Avatar',
    themes: 'Giao diện',
    powerUps: 'Vật phẩm hỗ trợ',
    price: 'Giá',
    owned: 'Đã sở hữu',
    buy: 'Mua',
    equip: 'Trang bị',
    equipped: 'Đang dùng',
    insufficientCoins: 'Không đủ xu',
  },

  rewards: {
    title: 'Phần thưởng',
    dailyReward: 'Phần thưởng hàng ngày',
    claimReward: 'Nhận thưởng',
    claimed: 'Đã nhận',
    comeBackTomorrow: 'Quay lại vào ngày mai',
    streak: 'Chuỗi ngày',
    streakBonus: 'Thưởng chuỗi ngày',
    luckyWheel: 'Vòng quay may mắn',
    spin: 'Quay',
    spinsLeft: 'Lượt quay còn lại',
    quests: 'Nhiệm vụ',
    dailyQuests: 'Nhiệm vụ hàng ngày',
    weeklyQuests: 'Nhiệm vụ tuần',
    questCompleted: 'Hoàn thành nhiệm vụ',
  },

  events: {
    title: 'Sự kiện',
    upcoming: 'Sắp diễn ra',
    ongoing: 'Đang diễn ra',
    past: 'Đã kết thúc',
    register: 'Đăng ký',
    registered: 'Đã đăng ký',
    participants: 'Người tham gia',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    prize: 'Giải thưởng',
    rules: 'Thể lệ',
  },

  notifications: {
    title: 'Thông báo',
    markAllRead: 'Đánh dấu tất cả đã đọc',
    noNotifications: 'Không có thông báo',
    newReply: 'có câu trả lời mới cho bài viết của bạn',
    newMessage: 'đã gửi tin nhắn cho bạn',
    friendRequest: 'đã gửi lời mời kết bạn',
    achievement: 'Bạn đã đạt được thành tựu mới',
    reward: 'Bạn đã nhận được phần thưởng',
  },

  time: {
    justNow: 'Vừa xong',
    minutesAgo: '{count} phút trước',
    hoursAgo: '{count} giờ trước',
    daysAgo: '{count} ngày trước',
    weeksAgo: '{count} tuần trước',
    monthsAgo: '{count} tháng trước',
    yearsAgo: '{count} năm trước',
  },

  errors: {
    general: 'Có lỗi xảy ra, vui lòng thử lại',
    network: 'Lỗi kết nối mạng',
    notFound: 'Không tìm thấy trang',
    unauthorized: 'Vui lòng đăng nhập',
    forbidden: 'Bạn không có quyền truy cập',
    serverError: 'Lỗi máy chủ',
    tryAgain: 'Thử lại',
  },
};

const en: TranslationKeys = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    confirm: 'Confirm',
    close: 'Close',
    viewAll: 'View All',
    seeMore: 'See More',
    noData: 'No data available',
    welcome: 'Welcome',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Sign Up',
    or: 'or',
    and: 'and',
  },

  nav: {
    home: 'Home',
    courses: 'Courses',
    games: 'Games',
    forum: 'Forum',
    friends: 'Friends',
    messages: 'Messages',
    events: 'Events',
    social: 'Community',
    rewards: 'Rewards',
    shop: 'Shop',
    profile: 'Profile',
    settings: 'Settings',
  },

  auth: {
    loginTitle: 'Log In',
    registerTitle: 'Create Account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginSuccess: 'Logged in successfully!',
    registerSuccess: 'Account created successfully!',
    loginError: 'Invalid email or password',
    invalidEmail: 'Invalid email address',
    weakPassword: 'Password is too weak',
  },

  dashboard: {
    welcomeBack: 'Welcome Back',
    level: 'Level',
    xp: 'Experience',
    coins: 'Coins',
    streak: 'Day Streak',
    dailyRewards: 'Daily Rewards',
    quickActions: 'Quick Actions',
    continueLearning: 'Continue Learning',
    yourProgress: 'Your Progress',
    recentActivity: 'Recent Activity',
  },

  courses: {
    title: 'Courses',
    allCourses: 'All Courses',
    myCourses: 'My Courses',
    purchased: 'Purchased',
    free: 'Free',
    premium: 'Premium',
    lessons: 'lessons',
    students: 'students',
    rating: 'rating',
    duration: 'Duration',
    difficulty: 'Difficulty',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    startLearning: 'Start Learning',
    continueLearning: 'Continue Learning',
    completed: 'Completed',
    progress: 'Progress',
    buyNow: 'Buy Now',
    enrolled: 'Enrolled',
    notEnrolled: 'Not Enrolled',
  },

  forum: {
    title: 'Q&A Forum',
    subtitle: 'Connect and share knowledge with the community',
    newPost: 'New Post',
    askQuestion: 'Ask a Question',
    categories: 'Categories',
    latestPosts: 'Latest Posts',
    trending: 'Trending',
    unanswered: 'Unanswered',
    solved: 'Solved',
    bookmarks: 'Bookmarks',
    notifications: 'Notifications',
    replies: 'replies',
    views: 'views',
    votes: 'votes',
    postTitle: 'Title',
    postContent: 'Detailed description',
    selectCategory: 'Select a category',
    tags: 'Tags',
    tagsPlaceholder: 'react, hooks, state (comma separated)',
    submitPost: 'Post Question',
    reply: 'Reply',
    replyPlaceholder: 'Write your answer...',
    submitReply: 'Submit Reply',
    markAsSolved: 'Mark as Accepted Answer',
    acceptedAnswer: 'Accepted Answer',
    editPost: 'Edit Post',
    deletePost: 'Delete Post',
    deleteConfirm: 'Are you sure you want to delete this?',
    reportPost: 'Report',
    noPostsYet: 'No posts yet',
    beFirstToPost: 'Be the first to ask a question',
    searchPosts: 'Search posts...',
    sortBy: 'Sort by',
    newest: 'Newest',
    oldest: 'Oldest',
    mostVotes: 'Most Votes',
    mostViews: 'Most Views',
    tips: 'Tips for a Great Question',
    tipsContent: [
      'Keep the title short and clear',
      'Describe the problem in detail',
      'Include code if applicable',
      'Choose the right category',
    ],
  },

  games: {
    title: 'Games',
    playNow: 'Play Now',
    leaderboard: 'Leaderboard',
    yourScore: 'Your Score',
    highScore: 'High Score',
    level: 'Level',
    lives: 'Lives',
    time: 'Time',
    score: 'Score',
    gameOver: 'Game Over',
    youWin: 'You Win!',
    tryAgain: 'Try Again',
    nextLevel: 'Next Level',
    codeBattle: 'Code Battle Arena',
    codeHero: 'Code Hero',
    javaNinja: 'Java Ninja',
    dungeonQuest: 'Dungeon Code Quest',
  },

  friends: {
    title: 'Friends',
    allFriends: 'All Friends',
    online: 'Online',
    offline: 'Offline',
    pending: 'Pending',
    addFriend: 'Add Friend',
    removeFriend: 'Unfriend',
    acceptRequest: 'Accept',
    declineRequest: 'Decline',
    sendMessage: 'Message',
    viewProfile: 'View Profile',
    noFriends: 'No friends yet',
    searchFriends: 'Search friends...',
    friendRequests: 'Friend Requests',
    sentRequests: 'Sent Requests',
  },

  messages: {
    title: 'Messages',
    newMessage: 'New Message',
    typeMessage: 'Type a message...',
    send: 'Send',
    noMessages: 'No messages yet',
    online: 'Active now',
    offline: 'Offline',
    typing: 'is typing...',
    seen: 'Seen',
    delivered: 'Delivered',
  },

  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    changeAvatar: 'Change Avatar',
    bio: 'Bio',
    joinedDate: 'Joined',
    totalXP: 'Total XP',
    coursesCompleted: 'Courses Completed',
    achievements: 'Achievements',
    statistics: 'Statistics',
    activityHistory: 'Activity History',
  },

  shop: {
    title: 'Shop',
    buyCoins: 'Buy Coins',
    items: 'Items',
    avatars: 'Avatars',
    themes: 'Themes',
    powerUps: 'Power-Ups',
    price: 'Price',
    owned: 'Owned',
    buy: 'Buy',
    equip: 'Equip',
    equipped: 'Equipped',
    insufficientCoins: 'Insufficient coins',
  },

  rewards: {
    title: 'Rewards',
    dailyReward: 'Daily Reward',
    claimReward: 'Claim Reward',
    claimed: 'Claimed',
    comeBackTomorrow: 'Come back tomorrow',
    streak: 'Day Streak',
    streakBonus: 'Streak Bonus',
    luckyWheel: 'Lucky Wheel',
    spin: 'Spin',
    spinsLeft: 'Spins remaining',
    quests: 'Quests',
    dailyQuests: 'Daily Quests',
    weeklyQuests: 'Weekly Quests',
    questCompleted: 'Quest Completed',
  },

  events: {
    title: 'Events',
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    past: 'Past',
    register: 'Register',
    registered: 'Registered',
    participants: 'Participants',
    startDate: 'Start Date',
    endDate: 'End Date',
    prize: 'Prize',
    rules: 'Rules',
  },

  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    newReply: 'replied to your post',
    newMessage: 'sent you a message',
    friendRequest: 'sent you a friend request',
    achievement: 'You unlocked a new achievement',
    reward: 'You received a reward',
  },

  time: {
    justNow: 'Just now',
    minutesAgo: '{count} minutes ago',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
    weeksAgo: '{count} weeks ago',
    monthsAgo: '{count} months ago',
    yearsAgo: '{count} years ago',
  },

  errors: {
    general: 'Something went wrong, please try again',
    network: 'Network error',
    notFound: 'Page not found',
    unauthorized: 'Please log in',
    forbidden: 'Access denied',
    serverError: 'Server error',
    tryAgain: 'Try again',
  },
};

export const translations: Record<Language, TranslationKeys> = {
  vi,
  en,
};
