// 游戏数据和状态
let words = [
    { english: 'apple', chinese: '苹果' },
    { english: 'banana', chinese: '香蕉' },
    { english: 'cat', chinese: '猫' },
    { english: 'dog', chinese: '狗' },
    { english: 'egg', chinese: '鸡蛋' },
    { english: 'fish', chinese: '鱼' },
    { english: 'goat', chinese: '山羊' },
    { english: 'hat', chinese: '帽子' },
    { english: 'ice', chinese: '冰' },
    { english: 'juice', chinese: '果汁' },
    { english: 'key', chinese: '钥匙' },
    { english: 'lion', chinese: '狮子' }
];

let gameState = {
    score: 0,
    timeRemaining: 60,
    timer: null,
    isPlaying: false,
    selectedCards: [],
    matchedPairs: 0,
    totalPairs: 0
};

// DOM元素
const gameBoard = document.querySelector('.game-board');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const editBtn = document.getElementById('edit-btn');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

// 模态框元素
const editModal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.getElementById('save-btn');
const addBtn = document.getElementById('add-btn');
const newEnglish = document.getElementById('new-english');
const newChinese = document.getElementById('new-chinese');
const wordList = document.querySelector('.word-list');

const gameOverModal = document.getElementById('game-over-modal');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');
const playAgainBtn = document.getElementById('play-again-btn');

// 事件监听器
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
editBtn.addEventListener('click', openEditModal);
closeBtn.addEventListener('click', closeEditModal);
saveBtn.addEventListener('click', saveWordChanges);
addBtn.addEventListener('click', addWord);
playAgainBtn.addEventListener('click', playAgain);

// 点击模态框外部关闭
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === gameOverModal) {
        closeGameOverModal();
    }
});

// 初始化编辑模态框的单词列表
function initWordList() {
    wordList.innerHTML = '';
    words.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <div class="word-text">
                <span class="word-english">${word.english}</span>
                <span class="word-chinese">${word.chinese}</span>
            </div>
            <button class="delete-word" data-index="${index}">删除</button>
        `;
        wordList.appendChild(wordItem);
    });
    
    // 添加删除单词的事件监听器
    document.querySelectorAll('.delete-word').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            words.splice(index, 1);
            initWordList();
        });
    });
}

// 打开编辑模态框
function openEditModal() {
    initWordList();
    editModal.style.display = 'flex';
}

// 关闭编辑模态框
function closeEditModal() {
    editModal.style.display = 'none';
    newEnglish.value = '';
    newChinese.value = '';
}

// 添加新单词
function addWord() {
    const english = newEnglish.value.trim();
    const chinese = newChinese.value.trim();
    
    if (english && chinese) {
        words.push({ english, chinese });
        initWordList();
        newEnglish.value = '';
        newChinese.value = '';
    } else {
        alert('请输入英文单词和中文释义');
    }
}

// 保存单词更改
function saveWordChanges() {
    // 保存单词到本地存储
    localStorage.setItem('wordPairs', JSON.stringify(words));
    closeEditModal();
    alert('单词已保存！');
    
    // 如果正在游戏，重置游戏
    if (gameState.isPlaying) {
        resetGame();
        startGame();
    }
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    resetGameState();
    
    // 从本地存储加载单词（如果有）
    const savedWords = localStorage.getItem('wordPairs');
    if (savedWords) {
        words = JSON.parse(savedWords);
    }
    
    // 确保有足够的单词
    if (words.length < 6) {
        alert('单词数量不足，请至少添加6组单词！');
        openEditModal();
        return;
    }
    
    // 创建游戏卡片
    createGameCards();
    
    // 启动计时器
    startTimer();
    
    // 更新UI状态
    startBtn.disabled = true;
    resetBtn.disabled = false;
    editBtn.disabled = true;
    gameState.isPlaying = true;
}

// 重置游戏状态
function resetGameState() {
    gameState.score = 0;
    gameState.timeRemaining = 60;
    gameState.selectedCards = [];
    gameState.matchedPairs = 0;
    gameState.totalPairs = 0;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    scoreDisplay.textContent = '0';
    timerDisplay.textContent = '60';
    gameBoard.innerHTML = '';
}

// 重置游戏
function resetGame() {
    clearInterval(gameState.timer);
    resetGameState();
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    editBtn.disabled = false;
    gameState.isPlaying = false;
}

// 创建游戏卡片
function createGameCards() {
    // 随机选择12个单词（6对）
    const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 12);
    gameState.totalPairs = shuffledWords.length;
    
    // 创建卡片数组
    const cards = [];
    shuffledWords.forEach(word => {
        cards.push({
            text: word.english,
            type: 'english',
            pairId: word.english
        });
        cards.push({
            text: word.chinese,
            type: 'chinese',
            pairId: word.english
        });
    });
    
    // 打乱卡片顺序
    const shuffledCards = cards.sort(() => Math.random() - 0.5);
    
    // 创建DOM元素
    shuffledCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = card.text;
        cardElement.dataset.type = card.type;
        cardElement.dataset.pairId = card.pairId;
        cardElement.dataset.index = index;
        
        cardElement.addEventListener('click', () => selectCard(cardElement));
        gameBoard.appendChild(cardElement);
    });
}

// 选择卡片
function selectCard(card) {
    // 如果卡片已经匹配或已经被选中，或者已经选了两张卡片，则不处理
    if (card.classList.contains('matched') || card.classList.contains('selected') || gameState.selectedCards.length >= 2) {
        return;
    }
    
    // 选中卡片
    card.classList.add('selected');
    gameState.selectedCards.push(card);
    
    // 如果选了两张卡片，检查是否匹配
    if (gameState.selectedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

// 检查匹配
function checkMatch() {
    const [card1, card2] = gameState.selectedCards;
    
    // 检查是否匹配：一个是英文，一个是中文，且pairId相同
    const isMatch = 
        card1.dataset.type !== card2.dataset.type && 
        card1.dataset.pairId === card2.dataset.pairId;
    
    if (isMatch) {
        // 匹配成功
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('selected');
        card2.classList.remove('selected');
        
        // 更新分数和匹配对数
        gameState.score += 10;
        gameState.matchedPairs++;
        scoreDisplay.textContent = gameState.score;
        
        // 检查游戏是否结束
        if (gameState.matchedPairs === gameState.totalPairs) {
            endGame(true);
        }
    } else {
        // 匹配失败
        card1.classList.remove('selected');
        card2.classList.remove('selected');
        
        // 扣分
        gameState.score = Math.max(0, gameState.score - 2);
        scoreDisplay.textContent = gameState.score;
    }
    
    // 清空选中的卡片
    gameState.selectedCards = [];
}

// 启动计时器
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeRemaining--;
        timerDisplay.textContent = gameState.timeRemaining;
        
        if (gameState.timeRemaining <= 0) {
            endGame(false);
        }
    }, 1000);
}

// 结束游戏
function endGame(isWin) {
    clearInterval(gameState.timer);
    gameState.isPlaying = false;
    
    // 显示游戏结束模态框
    if (isWin) {
        gameOverTitle.textContent = '恭喜你！';
        gameOverMessage.textContent = `你成功完成了游戏，得分：${gameState.score}`;
    } else {
        gameOverTitle.textContent = '游戏结束';
        gameOverMessage.textContent = `时间到！你的得分是：${gameState.score}`;
    }
    
    gameOverModal.style.display = 'flex';
    
    // 更新UI状态
    startBtn.disabled = false;
    resetBtn.disabled = true;
    editBtn.disabled = false;
}

// 关闭游戏结束模态框
function closeGameOverModal() {
    gameOverModal.style.display = 'none';
}

// 再玩一次
function playAgain() {
    closeGameOverModal();
    startGame();
}

// 初始化
function init() {
    // 从本地存储加载单词（如果有）
    const savedWords = localStorage.getItem('wordPairs');
    if (savedWords) {
        words = JSON.parse(savedWords);
    }
}

// 启动游戏
init();