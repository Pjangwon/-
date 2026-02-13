// --- 전역 변수 설정 ---
const dayListEl = document.getElementById('day-list');
const elEn = document.getElementById('en-word');
const elKr = document.getElementById('kr-word');
const elStatus = document.getElementById('status-text');
const btnToggle = document.getElementById('btn-toggle');
const btnNext = document.getElementById('btn-next');
const btnStar = document.getElementById('btn-star');
const chkBookmark = document.getElementById('chk-bookmark');

let currentPool = [];    // 현재 학습할 단어 목록
let currentWord = null;  // 현재 화면에 떠있는 단어 객체
let bookmarks = [];      // 오답노트(북마크) 저장소

// --- 1. 초기화 함수 (앱 시작 시 1회 실행) ---
function init() {
    // 저장된 북마크 불러오기
    const saved = localStorage.getItem('militaryVocaBook');
    if (saved) {
        bookmarks = JSON.parse(saved);
    }

    // 왼쪽 사이드바 생성 (data.js 기반)
    Object.keys(vocaDB).forEach(dayKey => {
        const div = document.createElement('div');
        div.className = 'day-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = dayKey;
        checkbox.checked = true; // 기본적으로 체크됨
        checkbox.className = 'day-checkbox';
        checkbox.addEventListener('change', updatePool);

        const label = document.createElement('label');
        label.htmlFor = dayKey;
        label.innerText = `${dayKey} (${vocaDB[dayKey].length}개)`;

        div.appendChild(checkbox);
        div.appendChild(label);
        dayListEl.appendChild(div);
    });

    // 이벤트 리스너 연결
    btnToggle.addEventListener('click', toggleMeaning);
    btnNext.addEventListener('click', nextWord);
    btnStar.addEventListener('click', toggleBookmark);
    chkBookmark.addEventListener('change', updatePool);

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        if(e.code === 'Space') {
            e.preventDefault(); // 스크롤 방지
            nextWord();
        }
        if(e.code === 'Enter') toggleMeaning();
    });

    // 최초 실행
    updatePool();
}

// --- 2. 단어 풀(Pool) 업데이트 ---
function updatePool() {
    currentPool = [];
    
    // 모드 확인: 오답노트 모드인가? 일반 모드인가?
    if (chkBookmark.checked) {
        // [오답노트 모드] 모든 Day를 뒤져서 북마크된 단어만 찾음
        Object.values(vocaDB).forEach(dayWords => {
            dayWords.forEach(word => {
                if (bookmarks.includes(word.en)) {
                    currentPool.push(word);
                }
            });
        });
        
        // 일반 체크박스 비활성화 (시각적 효과)
        document.querySelectorAll('.day-checkbox').forEach(box => box.disabled = true);
        
    } else {
        // [일반 모드] 체크된 Day의 단어들을 모두 합침
        document.querySelectorAll('.day-checkbox').forEach(box => {
            box.disabled = false; // 활성화
            if (box.checked) {
                currentPool = currentPool.concat(vocaDB[box.id]);
            }
        });
    }

    // 결과 처리
    if (currentPool.length === 0) {
        elStatus.innerText = "표시할 단어가 없습니다.";
        elEn.innerText = "Empty";
        elKr.innerText = chkBookmark.checked ? "저장된 오답노트가 없습니다." : "왼쪽에서 챕터를 선택해주세요.";
        elKr.classList.add('show');
        btnStar.style.display = 'none';
    } else {
        const modeText = chkBookmark.checked ? "🔥 오답노트 복습 중" : "일반 학습 모드";
        elStatus.innerText = `${modeText}: 총 ${currentPool.length}단어`;
        btnStar.style.display = 'block';
        nextWord();
    }
}

// --- 3. 다음 단어 랜덤 뽑기 ---
function nextWord() {
    if (currentPool.length === 0) return;

    // 랜덤 인덱스 생성
    const randomIndex = Math.floor(Math.random() * currentPool.length);
    currentWord = currentPool[randomIndex];

    // 화면 갱신
    elEn.innerText = currentWord.en;
    elKr.innerText = currentWord.kr;
    elKr.classList.remove('show'); // 뜻 숨기기
    btnToggle.innerText = "정답 확인 (Enter)";

    // 북마크 상태 반영 (별 색깔 칠하기)
    updateStarUI();
}

// --- 4. 뜻 토글 ---
function toggleMeaning() {
    if (currentPool.length === 0) return;
    elKr.classList.toggle('show');
}

// --- 5. 북마크 추가/제거 ---
function toggleBookmark() {
    if (!currentWord) return;

    const wordKey = currentWord.en;
    const index = bookmarks.indexOf(wordKey);

    if (index === -1) {
        bookmarks.push(wordKey); // 추가
    } else {
        bookmarks.splice(index, 1); // 제거
    }

    // 로컬스토리지에 저장 (영구 보관)
    localStorage.setItem('militaryVocaBook', JSON.stringify(bookmarks));
    
    updateStarUI();

    // 만약 오답노트 모드 중이라면, 별을 끄는 순간 리스트에서 사라져야 자연스러움
    if (chkBookmark.checked) {
        updatePool();
    }
}

// --- 6. 별 UI 업데이트 ---
function updateStarUI() {
    if (!currentWord) return;
    
    if (bookmarks.includes(currentWord.en)) {
        btnStar.classList.add('active');
        btnStar.innerText = "★";
    } else {
        btnStar.classList.remove('active');
        btnStar.innerText = "☆";
    }
}

// 앱 실행
init();