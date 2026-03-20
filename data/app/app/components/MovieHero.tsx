export interface MovieHeroProps {
    backdrop_path: any;
    title: any;
}

export default function MovieHero(props: MovieHeroProps) {

                        return (
                            <div className="p-4 border border-zinc-700 rounded-lg m-2 bg-zinc-900/50 backdrop-blur-sm">
                                <h3 className="text-sm font-mono text-zinc-400 mb-2">&lt;MovieHero /&gt;</h3>
                                <pre className="text-xs overflow-auto text-green-400">
                                    {JSON.stringify(props, null, 2)}
                                </pre>
                            </div>
                        );
                    
}
