from .BaseController import BaseController
# here iam trynig to control vectors db like reset and get info
# i know that i made this frunctions in the provider but lets see why we call it again here
from models.db_schemes import project, DataChunk
from stores.llm.LLMEnums import DocumentTypeEnum
import json 
from fastapi import Request
from typing import List
import ast
import re
import textwrap

class NLPController(BaseController):
    def __init__(self,vectordb_client,generation_client,embedding_client,template_parser):
        super().__init__()

        self.vectordb_client = vectordb_client
        self.generation_client = generation_client
        self.embedding_client = embedding_client
        self.template_parser = template_parser
        self.skills = None
        self.test = None
    def create_collection_name(self, project_id):
        return f"collection_{project_id}"
    
    def reset_vector_db_collection(self,project=project):
        collection_name = self.create_collection_name(project.project_id)
        return self.vectordb_client.delete_collection(collection_name=collection_name)
    
    def get_vector_db_collection_info(self,project=project):
        collection_name = self.create_collection_name(project.project_id)
        collection_info = self.vectordb_client.get_collection_info(collection_name=collection_name)
        return json.loads(#to convert string to dict
            json.dumps(collection_info , default =lambda x: x.__dict__)
        )

    def index_into_vector_db(self,project:project,chunks:list[DataChunk],chunks_ids:list[int],do_reset:bool = False):
        collection_name = self.create_collection_name(project_id=project.project_id)
        texts = [c.chunk_text for c in chunks]
        metadata =[c.chunk_metadata for c in chunks]
        vectors=[self.embedding_client.embed_text(text=text,document_type=DocumentTypeEnum.DOCUMENT.value) for text in texts] # object from LLMProviderFactory which mean object from CohereProvider which contain embed_text
        _ = self.vectordb_client.create_collection(
            collection_name=collection_name,
            embedding_size=self.embedding_client.embedding_size,
            do_reset=do_reset,)


        _ = self.vectordb_client.insert_many(
            collection_name = collection_name,
            texts = texts,
            metadata=metadata,
            vector = vectors,
            record_ids=chunks_ids,
        )

        return True
    def search_vector_db_collection(self,project:project,text:str,limit:int = 10):
        collection_name = self.create_collection_name(project_id=project.project_id)
        vector=self.embedding_client.embed_text(text=text,document_type=DocumentTypeEnum.QUERY.value)
        if not vector or len(vector)==0:
            return False 
        result = self.vectordb_client.search_by_vector(# result is similar to collection info as it contain many diff objects but after apply schema it became a document or dict
            collection_name = collection_name,
            vector = vector,
            limit=limit,
        )

        if not result:
            return False

        return result
    def answer_rag_question(self,project:project,query:str,asset_record,limit:int = 10):
        pormpt=""
        if query == "extract":
            pormpt=f"""
                    You are a professional, domain-agnostic resume parsing system.

                    Rules:
                    - Extract only information explicitly present in the resume.
                    - Do NOT hallucinate.
                    - Use null or empty lists if data is missing.
                    - Return VALID JSON ONLY.
                    - The response must start with {{ and end with }}.
                    - Each skill must be a single, standalone string.
                    - Extract languages and proficiency levels if explicitly mentioned.
                    - Do NOT infer language proficiency.
                    - No explanations.
                    - No markdown.

                    Resume:
                    <<<
                    {asset_record}
                    >>>

                    Return exactly this JSON schema:

                    {{
                    "name": string | null,

                    "skills": [
                        string
                    ],

                    "experience": [
                        {{
                        "role": string,
                        "company": string | null,
                        "type": "Internship" | "Full-time" | "Part-time",
                        "summary": string
                        }}
                    ],

                    "languages": [
                        {{
                        "language": string,
                        "level": string
                        }}
                    ]
                    }}
                    """
        
        answer , full_prompt , chat_history = None , None , None

        """retrieved_documents = self.search_vector_db_collection(project=project,text=query,limit = limit)
        if not retrieved_documents or len(retrieved_documents) == 0:
            return answer , full_prompt , chat_history"""
        
        system_prompt = self.template_parser.get("rag","system_prompt")

        
        
        """document_prompt = []
        for i,doc in enumerate(retrieved_documents):
        document_prompt.append(self.template_parser.get("rag","document_prompt",{
            "doc_num" : i+1 ,
            "chunk_text" : doc.text,
            }))"""

        """documents_prompts="\n".join ([
            self.template_parser.get("rag", "document_prompt", {
                    "doc_num": idx + 1,
                    "chunck_text": doc.text,
            })
            for idx, doc in enumerate(retrieved_documents)
        ])"""

        footer_prompt = self.template_parser.get("rag","footer_prompt", {
                    "query":pormpt,
                   
            })
        
        chat_history = [self.generation_client.construct_prompt(
            prompt = system_prompt,
            role = self.generation_client.enums.SYSTEM.value # instate fo writing coher or open ai enum and i don't know which one is used 
            )]

        full_prompt = "\n\n".join([footer_prompt])

        answer = self.generation_client.generate_text(
            prompt = footer_prompt,# footer_prompt it was full_prompt
            chat_history = chat_history
        )
        s1=""
        s1=answer
        s1=json.loads(s1)
        self.skills = s1['skills']
        self.test = "asd"
        return answer , full_prompt , chat_history
    def skill_gap_system(self,request:Request,query:str,user_skill,role:str="AI engineer"):
        answer , full_prompt , chat_history = None , None , None
        prompt_1 = f"""
                        List only the required skills for the role: {role}.
                        Do not include any descriptions, examples, or extra text.
                        Return the result strictly as a Python list of strings.
                        """
        system_prompt = self.template_parser.get("rag","system_prompt")
        chat_history_1 = [self.generation_client.construct_prompt(
            prompt = system_prompt,
            role = self.generation_client.enums.SYSTEM.value # instate fo writing coher or open ai enum and i don't know which one is used 
            )]
        
        footer_prompt_1 = self.template_parser.get("rag","footer_prompt", {
                    "query":prompt_1,
                   
            })
        #skills = request.app.state.skills
        #print(skills)
        response_requierd_skills = self.generation_client.generate_text(
            prompt = footer_prompt_1,# footer_prompt it was full_prompt
            chat_history = chat_history_1
        )

        clean_skills = self.split_commas(self.extract_skills(user_skill))
        cleaned = response_requierd_skills.replace("```python\n", "").replace("\n```", "")
        cleaned_skills_list = ast.literal_eval(cleaned)
        skills_list = self.split_commas(self.extract_skills(cleaned_skills_list))
        gap = set(skills_list) - set(clean_skills)
        full_prompt = "\n\n".join([footer_prompt_1])
        return gap , clean_skills , cleaned_skills_list , skills_list
    
    def split_commas(self,skills):
        result = []
        for skill in skills:
            if "," in skill:
                result.extend([s.strip() for s in skill.split(",")])
            else:
                result.append(skill)
        return result

    def extract_skills(self,skill_list):
        result = []

        for skill in skill_list:

            # استخراج النص داخل الأقواس
            match = re.search(r"\((.*?)\)", skill)

            if match:
                inside = match.group(1)
                subskills = [s.strip() for s in inside.split(",")]

                # إضافة المهارة الأساسية
                main_skill = skill.split("(")[0].strip()
                result.append(main_skill)

                # إضافة المهارات الفرعية
                result.extend(subskills)

            else:
                # إذا لم توجد أقواس
                result.append(skill)

        return result
    


    def learning_recommendtion(self,request:Request,user_gap_skill,role:str="AI engineer"):
        prompt_3 = textwrap.dedent(f"""
        You are a Skill Gap Learning Advisor.

        I will give you:
        1. A job role.
        2. A list of missing skills that the candidate does NOT have.

        Your task:
        - For EACH missing skill, recommend:
        a) 2 relevant Coursera courses (course title ONLY)
        b) 2 relevant Udemy courses (course title ONLY)
        c) 2 real GitHub project repositories the candidate can build or study

        Important rules:
        - DO NOT add descriptions.
        - DO NOT add explanations.
        - DO NOT include non-skill topics.
        - Return everything as a Python dictionary in this exact format:

        {{
        "skill_name": {{
            "coursera": ["course1", "course2"],
            "udemy": ["course1", "course2"],
            "github_projects": ["repo1", "repo2"]
        }},
        "skill_name_2": {{
            ...
        }}
        }}

        Here are the inputs:
        Role: {role}
        Missing Skills: {user_gap_skill}
        """)
        system_prompt = self.template_parser.get("rag","system_prompt")
        chat_history_1 = [self.generation_client.construct_prompt(
            prompt = system_prompt,
            role = self.generation_client.enums.SYSTEM.value # instate fo writing coher or open ai enum and i don't know which one is used 
            )]
        
        footer_prompt_1 = self.template_parser.get("rag","footer_prompt", {
                    "query":prompt_3,
                   
            })
        #skills = request.app.state.skills
        #print(skills)
        response_learning_recommendtion = self.generation_client.generate_text(
            prompt = footer_prompt_1,# footer_prompt it was full_prompt
            chat_history = chat_history_1
        )
        return response_learning_recommendtion