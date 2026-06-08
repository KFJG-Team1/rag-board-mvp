from pathlib import Path

import os
from datasets import load_dataset
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

DATA_PATH = Path("data/customer_support_faq.txt")
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY가 .env에 없습니다.")
# 데이터셋이 txt 파일로 없으면 Hugging Face에서 받아서 생성
if not DATA_PATH.exists():
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)

    dataset = load_dataset(
        "MakTek/Customer_support_faqs_dataset",
        split="train",
    )

    with DATA_PATH.open("w", encoding="utf-8") as f:
        for i, row in enumerate(dataset, start=1):
            f.write(f"### FAQ {i:03d}\n")
            f.write(f"Question: {row['question']}\n")
            f.write(f"Answer: {row['answer']}\n\n")

# 1. txt 파일 로드
loader = TextLoader(str(DATA_PATH), encoding="utf-8")
docs = loader.load()

# 2. chunk 나누기
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n### FAQ", "\nQuestion:", "\nAnswer:", "\n\n", "\n", " "],
)
chunks = splitter.split_documents(docs)

# [ 청크 출력 ] >>>>>>>>>>>>>>>>>>>>

# for i, chunk in enumerate(chunks, start=1):
#     print("=" * 80)
#     print(f"CHUNK {i}")
#     print(f"길이: {len(chunk.page_content)}")
#     print("metadata:", chunk.metadata)
#     print(chunk.page_content)

# <<<<<<<<<<<<<<<<<<<<[ 청크 출력 ]

# 3. embedding + vector DB 저장
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="customer_support_faq",
)

# 4. retriever 만들기
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 5. 질문 검색
question = "What is the most popular item?"
# question = "Can I change my address after ordering?"
related_docs = retriever.invoke(question)

context = "\n\n".join(doc.page_content for doc in related_docs)

# 6. LLM에게 검색 결과 기반 답변시키기
prompt = ChatPromptTemplate.from_template("""
You are a customer support assistant.
Answer using only the FAQ context below.

Context:
{context}

Question:
{question}
""")

llm = ChatOpenAI(model="gpt-4o-mini")
chain = prompt | llm

answer = chain.invoke({
    "context": context,
    "question": question,
})

print(answer.content)